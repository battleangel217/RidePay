from djoser import email
from .tasks import send_activation_email_task


class ActivationEmail(email.ActivationEmail):
    def send(self, to, *args, **kwargs):
        # Compile context and queue to Celery instead of sending synchronously.
        context = self.get_context_data()

        # Only pass serializable components to Celery.
        uid = context.get('uid')
        token = context.get('token')
        activation_url = context.get('url')
        site_name = context.get('site_name')

        # Email target
        user_email = to[0]

        send_activation_email_task.delay(
            user_email=user_email,
            uid=uid,
            token=token,
            activation_url=activation_url,
            site_name=site_name
        )
