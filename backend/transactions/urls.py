from django.urls import path
from .views import (
    TopUpWalletView, InterswitchWebhookView, PayRiderView, CashOutView,
    ApproveRiderView, SetFareView, GetFareView, TransactionHistoryView
)

urlpatterns = [
    path("history/", TransactionHistoryView.as_view(), name="transaction-history"),
    path("fare/", GetFareView.as_view(), name="get-fare"),
    path("topup/", TopUpWalletView.as_view(), name="topup-wallet"),
    path("webhook/interswitch/", InterswitchWebhookView.as_view(), name="interswitch-webhook"),
    path("pay/", PayRiderView.as_view(), name="pay-rider"),
    path("cashout/", CashOutView.as_view(), name="cash-out"),
    path("admin/approve-rider/<str:rider_id>/", ApproveRiderView.as_view(), name="admin-approve-rider"),
    path("admin/set-fare/", SetFareView.as_view(), name="admin-set-fare"),
]
