import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

async def send_email(email_to: str, subject: str, html_content: str):
    """
    Generic function to send emails using SMTP_SSL (Gmail Port 465).
    Works on Localhost AND Render Cloud.
    """
    try:
        # 1. Setup Message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_SENDER
        message["To"] = email_to

        # 2. Add HTML Body
        part = MIMEText(html_content, "html")
        message.attach(part)

        # 3. Create Secure SSL Context
        context = ssl.create_default_context()

        # 4. Connect to Server & Send
        # ✅ FIX: SMTP_SSL use kar rahe hain (Port 465 ke liye zaroori)
        # ✅ NOTE: 'server.starttls()' hata diya gaya hai kyunki SSL pehle se secure hai.
        with smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT, context=context) as server:
            server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            server.sendmail(
                settings.EMAIL_SENDER, email_to, message.as_string()
            )
        
        print(f"✅ Email sent successfully to {email_to}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

# ==========================================
# 1. FORGOT PASSWORD EMAIL
# ==========================================
async def send_reset_password_email(email_to: str, token: str):
    """
    Sends the specific 'Reset Password' email with the link.
    """
    # 🔗 Frontend Link (Apka Vercel URL)
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
    """
    Sends a reminder to students who forgot to checkout.
    """
    subject = "⚠️ Action Required: You forgot to Checkout!"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <div style="max-width: 500px; margin: auto; border-left: 5px solid #ef4444; padding: 20px; background-color: #fff5f5;">
                <h2 style="color: #b91c1c;">Session Not Closed</h2>
                <p>Hi <strong>{name}</strong>,</p>
                <p>It seems you forgot to mark your <strong>Check-Out</strong> for today's session.</p>
                <p>Please login to your dashboard and close your session to maintain your attendance record.</p>
                <br>
                <a href="https://student-productivity-app-brown.vercel.app/login" style="color: #b91c1c; font-weight: bold;">Go to Dashboard &rarr;</a>
            </div>
        </body>
    </html>
    """
    
    return await send_email(email_to, subject, html_content)
