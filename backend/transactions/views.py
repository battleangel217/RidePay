from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from drf_spectacular.utils import extend_schema, inline_serializer
import uuid

from .models import TransactionHistory, CashOut, FareSetting
from .interswitch import interswitch_client
from .serializers import TransactionHistorySerializer

User = get_user_model()

class TopUpWalletView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Initialize Wallet Top-up",
        description="Generates a transaction reference to be used with the Interswitch Javascript SDK to securely top up a passenger's wallet.",
        request=inline_serializer(
            name='TopUpRequest',
            fields={'amount': serializers.IntegerField()}
        )
    )
    def post(self, request):
        amount = request.data.get("amount")
        if not amount or int(amount) <= 0:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)
        
        amount_kobo = int(amount) * 100
        transaction_ref = f"TOPUP-{uuid.uuid4().hex[:10]}"
        
        try:
            # Create pending transaction
            txn = TransactionHistory.objects.create(
                receiver=request.user,
                amount=int(amount),
                transaction_type="TOPUP",
                interswitch_ref=transaction_ref,
                status="PENDING"
            )
            
            # Here we just generate the required parameters for the frontend to initialize Webpay or we call webpay API
            response_data = {
                "amount": amount_kobo,
                "transaction_ref": transaction_ref,
                "customer_id": request.user.id,
                "customer_name": request.user.username,
                "customer_email": request.user.email,
                "message": "Use these details to initialize Interswitch Webpay on the frontend"
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InterswitchWebhookView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Interswitch Webhook",
        description="Receives server-side payment confirmation from Interswitch. Marks the transaction as COMPLETED and credits the user's wallet.",
        request=inline_serializer(
            name='WebhookRequest',
            fields={
                'transactionRef': serializers.CharField(),
                'status': serializers.CharField()
            }
        )
    )
    @transaction.atomic
    def post(self, request):
        # Interswitch usually sends a transaction reference in the webhook
        transaction_ref = request.data.get("transactionRef") or request.data.get("txn_ref")
        payment_status = request.data.get("status")
        
        if not transaction_ref:
            return Response({"error": "Missing transaction reference"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            txn = TransactionHistory.objects.get(interswitch_ref=transaction_ref, transaction_type="TOPUP")
            
            if txn.status == "COMPLETED":
                return Response({"message": "Already processed"}, status=status.HTTP_200_OK)
                
            if payment_status == "SUCCESS":
                txn.status = "COMPLETED"
                txn.save()
                
                # Credit user wallet
                user = txn.receiver
                user.wallet += txn.amount
                user.save()
                
                return Response({"message": "Wallet credited"}, status=status.HTTP_200_OK)
            else:
                txn.status = "FAILED"
                txn.save()
                return Response({"message": "Payment failed"}, status=status.HTTP_200_OK)
                
        except TransactionHistory.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

class PayRiderView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Pay Rider via Code",
        description="Allows a passenger to pay an approved rider by scanning their QR code or typing their 6-character short code. Transfers funds instantly from Passenger to Rider wallet and sends a real-time WebSocket notification to the Rider.",
        request=inline_serializer(
            name='PayRiderRequest',
            fields={
                'code': serializers.CharField(),
                'amount': serializers.IntegerField(required=False)
            }
        )
    )
    @transaction.atomic
    def post(self, request):
        short_code_or_id = request.data.get("code")
        amount = request.data.get("amount")
        
        if not short_code_or_id:
            return Response({"error": "Rider short code or ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not amount:
            amount = FareSetting.get_fare()
            
        amount = int(amount)
        if amount <= 0:
            return Response({"error": "Invalid amount or global fare not set"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Try to find rider by short_code first, then by ID
            rider = User.objects.filter(short_code=short_code_or_id).first()
            if not rider:
                rider = User.objects.get(id=short_code_or_id)
                
            if rider.role != "driver":
                return Response({"error": "User is not a rider"}, status=status.HTTP_400_BAD_REQUEST)
                
            if not rider.is_approved_rider:
                return Response({"error": "Rider is not approved to receive payments"}, status=status.HTTP_403_FORBIDDEN)
                
            if request.user.wallet < amount:
                return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Perform transfer
            request.user.wallet -= amount
            request.user.save()
            
            rider.wallet += amount
            rider.save()
            
            # Log transaction
            TransactionHistory.objects.create(
                sender=request.user,
                receiver=rider,
                amount=amount,
                transaction_type="TRANSFER",
                status="COMPLETED"
            )
            
            # Send WebSocket notification to rider
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{rider.id}",
                {
                    "type": "payment_notification",
                    "message": f"Payment of NGN {amount} received from {request.user.username}",
                    "amount": amount
                }
            )
            
            return Response({"message": "Payment successful"}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({"error": "Rider not found"}, status=status.HTTP_404_NOT_FOUND)

class CashOutView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Rider Cash Out",
        description="Allows an approved Rider to withdraw their wallet earnings directly to their bank account using the Interswitch Disbursement API.",
        request=inline_serializer(
            name='CashOutRequest',
            fields={
                'amount': serializers.IntegerField(),
                'account_number': serializers.CharField(),
                'bank_code': serializers.CharField()
            }
        )
    )
    def post(self, request):
        if request.user.role != "driver":
            return Response({"error": "Only riders can cash out"}, status=status.HTTP_403_FORBIDDEN)
            
        if not request.user.is_approved_rider:
            return Response({"error": "Rider is not approved to cash out"}, status=status.HTTP_403_FORBIDDEN)
            
        amount = request.data.get("amount")
        account_number = request.data.get("account_number")
        bank_code = request.data.get("bank_code")
        
        if not all([amount, account_number, bank_code]):
            return Response({"error": "Amount, account_number, and bank_code are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        amount = int(amount)
        amount_kobo = amount * 100
        
        if request.user.wallet < amount:
            return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Deduct wallet first to prevent double spending
        request.user.wallet -= amount
        request.user.save()
        
        interswitch_ref = f"CASHOUT-{uuid.uuid4().hex[:10]}"
        
        cashout = CashOut.objects.create(
            rider=request.user,
            amount=amount,
            bank_account=account_number,
            bank_code=bank_code,
            interswitch_ref=interswitch_ref,
            status="PENDING"
        )
        
        TransactionHistory.objects.create(
            sender=request.user,
            receiver=None,
            amount=amount,
            transaction_type="WITHDRAWAL",
            interswitch_ref=interswitch_ref,
            status="PENDING"
        )
        
        try:
            # Call Interswitch Disbursement API
            resp = interswitch_client.disburse_funds(amount_kobo, account_number, bank_code, interswitch_ref)
            
            # Note: A real app should check the specific Interswitch response format
            # For hackathon/sandbox, we assume success or handle errors basically.
            if resp and resp.get("status") in ["SUCCESS", "SUCCESSFUL"]:
                cashout.status = "COMPLETED"
                cashout.save()
                
                # update transaction history
                txn = TransactionHistory.objects.get(interswitch_ref=interswitch_ref)
                txn.status = "COMPLETED"
                txn.save()
                
                return Response({"message": "Cash out successful"}, status=status.HTTP_200_OK)
            else:
                # If failed, refund wallet
                request.user.wallet += amount
                request.user.save()
                
                cashout.status = "FAILED"
                cashout.save()
                
                txn = TransactionHistory.objects.get(interswitch_ref=interswitch_ref)
                txn.status = "FAILED"
                txn.save()
                
                error_msg = resp.get("errors") or resp.get("message") or "Interswitch Error"
                return Response({"error": f"Cash out failed: {error_msg}"}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            # In case of exception (e.g., timeout), we shouldn't fail right away without checking status
            # But for hackathon, we can refund and log error
            request.user.wallet += amount
            request.user.save()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ApproveRiderView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Admin: Approve Rider",
        description="Allows an Admin to approve or suspend a driver's account. Drivers must be approved to receive payments or cash out.",
        request=inline_serializer(
            name='ApproveRiderRequest',
            fields={'is_approved': serializers.BooleanField()}
        )
    )
    def post(self, request, rider_id):
        is_approved = request.data.get("is_approved", True)
        is_approved = str(is_approved).lower() in ("true", "1", "yes")

        try:
            rider = User.objects.get(id=rider_id, role="driver")
            rider.is_approved_rider = is_approved
            rider.save()
            status_text = "approved" if is_approved else "suspended"
            return Response({"message": f"Rider is now {status_text}"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Rider not found"}, status=status.HTTP_404_NOT_FOUND)

class SetFareView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Admin: Set Default Fare",
        description="Sets the global system default transport fare.",
        request=inline_serializer(
            name='SetFareRequest',
            fields={'amount': serializers.IntegerField()}
        )
    )
    def post(self, request):
        amount = request.data.get("amount")
        if not amount or int(amount) <= 0:
            return Response({"error": "Invalid fare amount"}, status=status.HTTP_400_BAD_REQUEST)

        setting, _ = FareSetting.objects.get_or_create(id=1)
        setting.default_fare = int(amount)
        setting.save()

        return Response({"message": f"Global default fare set to {amount}"}, status=status.HTTP_200_OK)

class GetFareView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Default Fare",
        description="Retrieves the current global default transport fare. Useful for displaying the price on the frontend before confirming payment.",
        responses=inline_serializer(
            name='GetFareResponse',
            fields={'fare': serializers.IntegerField()}
        )
    )
    def get(self, request):
        fare = FareSetting.get_fare()
        return Response({"fare": fare}, status=status.HTTP_200_OK)

class TransactionHistoryView(ListAPIView):
    serializer_class = TransactionHistorySerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Transaction History",
        description="Retrieves a list of all transactions for the authenticated user, ordered by most recent.",
        responses=TransactionHistorySerializer(many=True)
    )
    def get_queryset(self):
        user = self.request.user
        return TransactionHistory.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-timestamp')

