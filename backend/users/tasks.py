import os
import requests
from django.conf import settings
from django.template.loader import render_to_string

def send_activation_email_task(user_email, uid, token, activation_url, site_name):
    """
    Sends the activation email using Brevo's direct REST API instead of Celery.
    """
    subject = f"Verify your {site_name} Account"

    context = {
        'uid': uid,
        'token': token,
        'url': activation_url,
        'site_name': site_name,
    }

    html_message = render_to_string('email/activation.html', context)

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": os.environ.get("BREVO_API_KEY", ""),
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "email": settings.DEFAULT_FROM_EMAIL,
            "name": site_name
        },
        "to": [
            {
                "email": user_email
            }
        ],
        "subject": subject,
        "htmlContent": html_message
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status() # raises an exception if the API call fails
    
    return f"Activation email sent to {user_email}"
