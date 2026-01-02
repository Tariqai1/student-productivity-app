import smtplib
import ssl
import socket  # 👈 Zaroori import
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

# ==========================================
# 🛑 IPv4 FORCE HACK
# ==========================================
# Render kabhi-kabhi IPv6 use karta hai jo Gmail block kar deta hai.
# Ye code zabardasti IPv4 use karega.
orig_getaddrinfo = socket.getaddrinfo

def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    if family == 0:
        family = socket.AF_INET # Force IPv4
    return orig_getaddrinfo(host, port, family, type, proto, flags)

socket.getaddrinfo = getaddrinfo_ipv4
# ==========================================

async def send_email(email_to: str, subject: str, html_content: str):
    """
    Sends email using SMTP_SSL (Port 465) with Forced IPv4.
    """
    try:
        # Debug Print
        print(f"📧 [Email System] Connecting to {settings.EMAIL_HOST}:465 (Forced IPv4)...")
        
        # 1. Setup Message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_SENDER
        message["To"] = email_to

        # 2. Add HTML Body
        part = MIMEText(html_content, "html")
        message.attach(part)

        # 3. SSL Context
        context = ssl.create_default_context()

        # 4. Connect (Hardcoded Port 465 for Stability)
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            server.sendmail(
                settings.EMAIL_SENDER, email_to, message.as_string()
            )
        
        print(f"✅ Email sent successfully to {email_to}")
        return True

    except Exception as e:
        print(f"❌ [Email Failed] Error: {e}")
        return False

# ==========================================
# 1. FORGOT PASSWORD EMAIL
# ==========================================
async def send_reset_password_email(email_to: str, token: str):
    base_url = "https://student-productivity-app-brown.vercel.app" 
    reset_link = f"{base_url}/reset-password?token={token}"

    subject = "Reset Your Password - StudentApp"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <div style="max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>Click below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
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
    <html><body><p>Hi {name}, please checkout.</p></body></html>
    """
    return await send_email(email_to, subject, html_content)
