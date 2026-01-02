from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from pydantic import EmailStr
from typing import List

# 1. Connection Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL_SENDER,
    MAIL_PASSWORD=settings.EMAIL_PASSWORD,
    MAIL_FROM=settings.EMAIL_SENDER,
    MAIL_PORT=settings.EMAIL_PORT,
    MAIL_SERVER=settings.EMAIL_HOST,
    
    # SSL Settings for Port 465 (Isse Network Unreachable Error fix hoga)
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(email_to: str, subject: str, html_content: str):
    """
    Sends email using fastapi-mail wrapper.
    """
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

# ==========================================
# 1. FORGOT PASSWORD EMAIL
# ==========================================
async def send_reset_password_email(email_to: str, token: str):
    # Frontend Link
    base_url = "https://student-productivity-app-brown.vercel.app" 
    reset_link = f"{base_url}/reset-password?token={token}"

    subject = "Reset Your Password - StudentApp"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <div style="max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to choose a new password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                
                <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email. The link will expire in 30 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; font-size: 12px; color: #999;">Student Productivity App</p>
            </div>
        </body>
    </html>
    """
    return await send_email(email_to, subject, html_content)

# ==========================================
# 2. CHECKOUT REMINDER EMAIL
# ==========================================
async def send_checkout_reminder(email_to: str, name: str):
    subject = "⚠️ Action Required: You forgot to Checkout!"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <div style="max-width: 500px; margin: auto; border-left: 5px solid #ef4444; padding: 20px; background-color: #fff5f5;">
                <h2 style="color: #b91c1c;">Session Not Closed</h2>
                <p>Hi <strong>{name}</strong>,</p>
                <p>It seems you forgot to mark your <strong>Check-Out</strong> for today's session.</p>
                <a href="https://student-productivity-app-brown.vercel.app/login" style="color: #b91c1c; font-weight: bold;">Go to Dashboard &rarr;</a>
            </div>
        </body>
    </html>
    """
    return await send_email(email_to, subject, html_content)
