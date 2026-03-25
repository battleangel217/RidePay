from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.


class TransactionHistory(models.Model):
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="user_sender")
    reciever = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="user_reciever")
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
    timestamp = models.DateTimeField(auto_now_add=True)
