import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

INTERSWITCH_CLIENT_ID = os.getenv("INTERSWITCH_CLIENT_ID")
INTERSWITCH_CLIENT_SECRET = os.getenv("INTERSWITCH_CLIENT_SECRET")
# Sandbox environment URLs
BASE_URL = "https://sandbox.interswitchng.com"

class InterswitchClient:
    def __init__(self):
        self.client_id = INTERSWITCH_CLIENT_ID
        self.client_secret = INTERSWITCH_CLIENT_SECRET
        self.base_url = BASE_URL
        self._access_token = None

    def get_access_token(self):
        if self._access_token:
            return self._access_token
            
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode('utf-8')
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "client_credentials"
        }
        
        url = f"{self.base_url}/passport/oauth/token"
        response = requests.post(url, headers=headers, data=data)
        
        if response.status_code == 200:
            self._access_token = response.json().get("access_token")
            return self._access_token
        else:
            print("Error authenticating Interswitch:", response.text)
            return None

    def create_payment_link(self, amount, transaction_ref, customer_id, customer_name, customer_email):
        """
        Creates a payment request using Interswitch Collections/Webpay API
        amount: integer (in kobo/cents)
        """
        token = self.get_access_token()
        if not token:
            raise Exception("Cannot get Interswitch access token")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # NOTE: This endpoint structure depends on the specific Interswitch API product being used 
        # (e.g. Webpay, Quickteller Collections). Assumed Collections payload for demonstration.
        url = f"{self.base_url}/collections/w/pay"
        
        payload = {
            "amount": amount,
            "currency": "NGN",
            "transactionRef": transaction_ref,
            "customerId": customer_id,
            "customerName": customer_name,
            "customerEmail": customer_email,
            "paymentDescription": "RidePay Wallet Top-up"
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    def disburse_funds(self, amount, account_number, bank_code, ref):
        """
        Disburses earnings to rider's bank account via Interswitch Transfer/Disbursement API
        """
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}/api/v2/quickteller/payments/transfers"
        
        payload = {
            "amount": amount,
            "bankCode": bank_code,
            "accountNumber": account_number,
            "transferCode": ref,
            "currency": "566" # NGN
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

interswitch_client = InterswitchClient()
