import requests
from app.core.config import settings

async def send_email(email_to: str, subject: str, html_content: str):
    """
    Sends email using Brevo (Sendinblue) API via HTTP Request.
    This bypasses Port 587/465 blocking on Render.
    """
    url = "https://api.brevo.com/v3/smtp/email"
    
    headers = {
        "accept": "application/json",
        "api-key": settings.EMAIL_API_KEY, # Config se key uthayega
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"email": settings.EMAIL_SENDER, "name": "Student App"},
        "to": [{"email": email_to}],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        print(f"🚀 [Brevo API] Sending email to {email_to}...")
        
        # Ye normal website request ki tarah jata hai (Port 443)
        # Isliye Render isse block nahi karega
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code in [200, 201, 202]:
            print(f"✅ Email sent successfully! Message ID: {response.json().get('messageId')}")
            return True
        else:
            print(f"❌ [Brevo Failed] Status: {response.status_code}, Error: {response.text}")
            return False

    except Exception as e:
        print(f"❌ [API Error] Failed to connect: {e}")
        return False

# ==========================================
# 1. FORGOT PASSWORD EMAIL
# ==========================================
async def send_reset_password_email(email_to: str, token: str):
    # Apna Vercel Link yahan dalein
    base_url = "https://student-productivity-app-brown.vercel.app" 
    reset_link = f"{base_url}/reset-password?token={token}"

    subject = "Reset Your Password"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_link}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Ignore if you didn't request this.</p>
        </body>
    </html>
    """
    return await send_email(email_to, subject, html_content)

# ==========================================
# 2. CHECKOUT REMINDER EMAIL
# ==========================================
async def send_checkout_reminder(email_to: str, name: str):
    subject = "⚠️ Action Required: You forgot to Checkout!"
    html_content = f"<p>Hi {name}, please checkout from your dashboard.</p>"
    return await send_email(email_to, subject, html_content)
