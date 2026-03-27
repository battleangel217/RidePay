from djoser import email
import threading
from .tasks import send_activation_email_task


class ActivationEmail(email.ActivationEmail):
    def send(self, to, *args, **kwargs):
        # Compile context
        context = self.get_context_data()

        # Extract components
        uid = context.get('uid')
        token = context.get('token')
        activation_url = context.get('url')
        site_name = context.get('site_name')

        # Email target
        user_email = to[0]

        # Use threading to trigger the API request without blocking the user response
        threading.Thread(target=send_activation_email_task, kwargs={
            'user_email': user_email,
            'uid': uid,
            'token': token,
            'activation_url': activation_url,
            'site_name': "RidePay"
        }).start()
