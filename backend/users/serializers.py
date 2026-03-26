from .models import CustomUserModel
from rest_framework import serializers
from djoser.serializers import UserSerializer, UserCreateSerializer
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class CustomUserCreateSerializer(UserCreateSerializer):
    plate_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ("email", "username", "password", "role", "plate_number")

    def create(self, validate_data):
        email = validate_data.get('email')
        role = validate_data.get('role')
        username = validate_data.get("username")
        plate_number = validate_data.get("plate_number")

        short_code = None
        if role == "driver":
            id = f"DRI-{str(uuid.uuid4())[4:18]}"
            # Generate a 6 character short code for passengers to easily type in
            short_code = str(uuid.uuid4()).replace("-", "")[:6].upper()
        else:
            id = f"PASS-{str(uuid.uuid4())[4:18]}"

        email = email.strip() if email else None

        if not email or not role or not username:
            raise serializers.ValidationError("You must provide email,username and role.")
        
        user = CustomUserModel(
            email=email,
            role=role,
            username=username,
            id=id,
            short_code=short_code,
            plate_number=plate_number if role == "driver" else None
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
        fields = ("id", "username", "role", "email", "plate_number", "short_code", "is_approved_rider", "wallet")
        read_only_fields = ("id", "username", "role", "email", "plate_number", "short_code", "is_approved_rider", "wallet")

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    user = CustomUserSerializer(read_only=True)

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = CustomUserSerializer(self.user).data
        return data