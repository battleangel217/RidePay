from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


@shared_task
def send_activation_email_task(user_email, uid, token, activation_url, site_name):
    """
    Sends the activation email asynchronously via Celery.
    """
    subject = f"Verify your {site_name} Account"

    context = {
        'uid': uid,
        'token': token,
        'url': activation_url,
        'site_name': site_name,
    }

    html_message = render_to_string('email/activation.html', context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        html_message=html_message,
        fail_silently=False,
    )
    return f"Activation email queued for {user_email}"
