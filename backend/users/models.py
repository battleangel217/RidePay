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
    username = models.CharField(unique=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    id = models.CharField(primary_key=True, max_length=30, unique=True)
    wallet = models.PositiveIntegerField()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
