# email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_verification_code(to_email, code):
    # Configuration pour Gmail
    sender_email = "elammariachraf351@gmail.com"
    password = "ntqr armu goln vhya"  # Utiliser un mot de passe d'application

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = to_email
    message["Subject"] = "Code de vérification Yuya"

    body = f"Votre code de vérification est : {code}"
    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, password)
            server.send_message(message)
        return True
    except Exception as e:
        print(f"Erreur d'envoi d'email: {e}")
        return False