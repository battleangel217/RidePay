from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, inline_serializer

from google.auth.transport import requests as google_request
from google.oauth2 import id_token
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomUserSerializer

User = get_user_model()

class UpdatePlateNumberView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Update Rider Plate Number",
        description="Allows a driver to update their vehicle's license plate number.",
        request=inline_serializer(
            name='UpdatePlateNumberRequest',
            fields={'plate_number': serializers.CharField(max_length=20)}
        ),
        responses={200: inline_serializer(name='UpdatePlateNumberResponse', fields={'message': serializers.CharField(), 'plate_number': serializers.CharField()})}
    )
    def put(self, request):
        if request.user.role != 'driver':
            return Response({"error": "Only drivers can update their plate number"}, status=status.HTTP_403_FORBIDDEN)
            
        plate_number = request.data.get("plate_number")
        if not plate_number:
            return Response({"error": "Plate number is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        request.user.plate_number = plate_number
        request.user.save()
        
        return Response({
            "message": "Plate number updated successfully",
            "plate_number": plate_number
        }, status=status.HTTP_200_OK)


class GoogleSignupView(APIView):
    @extend_schema(
        summary="Google OAuth Sign-In",
        description="Accepts a Google OAuth token, verifies it, and either logs the user in or registers a new account. Returns JWT tokens and user data.",
        request=inline_serializer(
            name="GoogleSignupRequest",
            fields={"token": serializers.CharField()}
        ),
        responses=inline_serializer(
            name="GoogleSignupResponse",
            fields={
                "refresh": serializers.CharField(),
                "access": serializers.CharField(),
                "user": CustomUserSerializer()
            }
        )
    )
    def post(self, request):
        token = request.data.get('token')

        if not token:
            return Response({"error":"Token not provided", "status":False}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            req = google_request.Request()
            try:
                id_info = id_token.verify_oauth2_token(token, req, settings.GOOGLE_OAUTH_CLIENT_ID)
            except Exception as e:
                return Response({"error": "Token verification failed", "details": str(e)}, status=400)

            email = id_info['email']
            firstname = id_info.get('given_name', '')
            lastname = id_info.get('family_name', '')
            name = f"{lastname} {firstname}"

            user, created = User.objects.get_or_create(email=email)
            if created:
                user.set_unusable_password()
                user.username = name
                user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": CustomUserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HealthCheckView(APIView):
    permission_classes = []

    @extend_schema(
        summary="Server Health Check",
        description="Returns a 200 OK status to indicate that the server is up and running. Used by load balancers and deployment services.",
        responses=inline_serializer(name='HealthCheckResponse', fields={'status': serializers.CharField()})
    )
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
