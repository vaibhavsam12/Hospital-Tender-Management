import os
from typing import List
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr, BaseModel
from dotenv import load_dotenv

load_dotenv()

class EmailSchema(BaseModel):
    email: List[EmailStr]
    body: str
    subject: str

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "admin@healthtender.pro"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "password"),
    MAIL_FROM = os.getenv("MAIL_FROM", "admin@healthtender.pro"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "HealthTender Pro Admin"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_email_async(subject: str, email_to: str, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"EMAIL ERROR: {e}")
        return False

async def send_tender_notification(email_to: str, tender_title: str, status: str):
    subject = f"Tender Update: {tender_title}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #00d4ff;">HealthTender Pro Update</h2>
            <p>Hello,</p>
            <p>The tender <strong>{tender_title}</strong> has been updated to status: <span style="font-weight: bold; color: #7c3aed;">{status.upper()}</span>.</p>
            <p>Log in to your dashboard to see more details.</p>
            <br>
            <p>Regards,<br>HealthTender Pro Team</p>
        </div>
    </body>
    </html>
    """
    return await send_email_async(subject, email_to, body)
