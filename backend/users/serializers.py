from .models import CustomUserModel
from rest_framework import serializers
from djoser.serializers import UserSerializer, UserCreateSerializer
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class CustomUserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ("email", "username", "password", "role")

    def create(self, validate_data):
        email = validate_data.get('email')
        role = validate_data.get('role')
        username = validate_data.get("username")

        if role == "driver":
            id = f"DRI-{str(uuid.uuid4())[4:18]}"
        else:
            id = f"PASS-{str(uuid.uuid4())[4:18]}"

        email = email.strip() if email else None

        if not email or not role or not username:
            raise serializers.ValidationError("You must provide email,username and role.")
        
        user = CustomUserModel(
            email=email,
            role=role,
            username=username,
            id=id
        )
        user.set_password(validate_data['password'])
        user.save()

        return user
    

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
        


class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ("id", "username", "role", "email")
        read_only_fields = ("id", "username", "role", "email")