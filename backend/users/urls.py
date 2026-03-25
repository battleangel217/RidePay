from django.urls import path
from .views import UpdatePlateNumberView, GoogleSignupView

urlpatterns = [
    path('plate-number/', UpdatePlateNumberView.as_view(), name='update-plate-number'),
    path('google/', GoogleSignupView.as_view(), name='google-signup'),
]
