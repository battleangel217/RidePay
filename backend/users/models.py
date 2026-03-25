from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# Create your models here.

ROLE_CHOICES = [
    ("passenger", "passenger"),
    ("driver", "driver")
]

class CustomUserModel(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(unique=False, max_length=50)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    id = models.CharField(primary_key=True, max_length=30, unique=True)
    wallet = models.PositiveIntegerField(default=0)
    short_code = models.CharField(max_length=6, blank=True, null=True, unique=True)
    qr_code_url = models.URLField(blank=True, null=True)
    is_approved_rider = models.BooleanField(default=False)
    plate_number = models.CharField(max_length=20, blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
