from rest_framework import serializers
from .models import TransactionHistory

class TransactionHistorySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = TransactionHistory
        fields = ['id', 'amount', 'status', 'transaction_type', 'interswitch_ref', 'timestamp', 'sender_name', 'receiver_name']
