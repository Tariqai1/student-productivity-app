from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

# 1. Connection Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL_SENDER,
    MAIL_PASSWORD=settings.EMAIL_PASSWORD,
    MAIL_FROM=settings.EMAIL_SENDER,
    MAIL_PORT=settings.EMAIL_PORT,
    MAIL_SERVER=settings.EMAIL_HOST,
    
    # 👇 CHANGE: TLS (587) Configuration
    MAIL_STARTTLS=True,  # ✅ TRUE for Port 587
    MAIL_SSL_TLS=False,  # ✅ FALSE for Port 587
    
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(email_to: str, subject: str, html_content: str):
    try:
        print(f"📧 [Email Debug] Sending to {email_to} via {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        
        message = MessageSchema(
            subject=subject,
            recipients=[email_to],
            body=html_content,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        
        print(f"✅ Email sent successfully to {email_to}")
        return True

    except Exception as e:
        print(f"❌ [Email Failed] Error: {e}")
        return False

# ... (Rest of the file remains exactly the same) ...
# Copy the send_reset_password_email and send_checkout_reminder functions from your previous code
# Ensure send_reset_password_email and send_checkout_reminder are present here
async def send_reset_password_email(email_to: str, token: str):
    base_url = "https://student-productivity-app-brown.vercel.app" 
    reset_link = f"{base_url}/reset-password?token={token}"
    subject = "Reset Your Password - StudentApp"
    html_content = f"""
    <html><body style="font-family: Arial; padding: 20px;">
    <h2>Password Reset</h2>
    <a href="{reset_link}">Click here to reset</a>
    </body></html>
    """
    return await send_email(email_to, subject, html_content)

async def send_checkout_reminder(email_to: str, name: str):
    subject = "⚠️ Action Required: You forgot to Checkout!"
    html_content = f"Hi {name}, please checkout."
    return await send_email(email_to, subject, html_content)
