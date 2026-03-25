from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.


class TransactionHistory(models.Model):
    sender = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="user_sender")
    receiver = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="user_receiver")
    amount = models.PositiveIntegerField()

    status_choices = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    status = models.CharField(max_length=10, choices=status_choices, default='PENDING')

    transaction_type_choices = [
        ('TOPUP', 'Top Up'),
        ('TRANSFER', 'Transfer'),
        ('WITHDRAWAL', 'Withdrawal'),
    ]
    transaction_type = models.CharField(max_length=20, choices=transaction_type_choices)
    interswitch_ref = models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class CashOut(models.Model):
    rider = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cashouts")
    amount = models.PositiveIntegerField()
    bank_account = models.CharField(max_length=50) # e.g., accountNumber
    bank_code = models.CharField(max_length=20) # e.g., bankCode
    interswitch_ref = models.CharField(max_length=100, blank=True, null=True)
    
    status_choices = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    status = models.CharField(max_length=10, choices=status_choices, default='PENDING')
    timestamp = models.DateTimeField(auto_now_add=True)


class FareSetting(models.Model):
    """Global configuration for default school transport fare."""
    default_fare = models.PositiveIntegerField(default=100)
    
    @classmethod
    def get_fare(cls):
        setting, created = cls.objects.get_or_create(id=1)
        return setting.default_fare

