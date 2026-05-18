import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import random

def generate_otp() -> str:
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def send_otp_email(email: str, otp: str, purpose: str = "verification") -> bool:
    if not settings.SMTP_HOST:
        print(f"OTP for {email} ({purpose}): {otp}")
        return True
    
    try:
        subject = f"BenchBridge - {'Verification' if purpose == 'verification' else 'Password Reset'} OTP"
        body = f"""
        <html>
        <body>
            <h2>Your OTP for BenchBridge</h2>
            <p>Your OTP for {purpose} is: <strong>{otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
        </html>
        """
        
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False