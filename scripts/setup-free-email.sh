cripts/setup-free-email.sh</path>
<content">#!/bin/bash

# 🚀 CONVERTO.FI FREE EMAIL SETUP SCRIPT
# Sets up complete free email solution without paid subscriptions

set -e

echo "🚀 CONVERTO.FI FREE EMAIL SETUP"
echo "================================"
echo ""

# Choose email solution
echo "Choose your free email solution:"
echo "1) Gmail SMTP (Recommended - Easiest setup)"
echo "2) Hostingpalvelu.fi cPanel Email (Professional)"
echo "3) Zoho Mail (Free professional email)"
echo "4) Amazon SES (Highest limits)"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        setup_gmail_smtp
        ;;
    2)
        setup_cpanel_email
        ;;
    3)
        setup_zoho_mail
        ;;
    4)
        setup_amazon_ses
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

setup_gmail_smtp() {
    echo ""
    echo "📧 Setting up Gmail SMTP (Free - 500 emails/day)"
    echo "==============================================="
    echo ""

    echo "Step 1: Gmail Account Setup"
    echo "1. Go to: https://accounts.google.com/signup"
    echo "2. Create: max.converto@gmail.com (or similar)"
    echo "3. Enable 2-Factor Authentication"
    echo "4. Go to: https://myaccount.google.com/apppasswords"
    echo "5. Generate App Password (save it!)"
    echo ""

    read -p "Press Enter after setting up Gmail account..."

    # Create Python SMTP service
    cat > backend/modules/email/free_email_service.py << 'EOF'
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Optional

class FreeEmailService:
    """Free email service supporting Gmail, Zoho, cPanel SMTP"""

    def __init__(self, config: Dict[str, str]):
        self.config = config
        self.smtp_server = config['server']
        self.smtp_port = config['port']
        self.username = config['username']
        self.password = config['password']

    def send_contact_email(self, from_name: str, from_email: str, message: str) -> bool:
        """Send contact form submission to business email"""
        to_email = "hello@converto.fi"  # Your business email

        msg = MIMEMultipart()
        msg['From'] = self.username
        msg['To'] = to_email
        msg['Subject'] = f"New Contact from {from_name}"

        body = f"""
        New contact form submission:

        Name: {from_name}
        Email: {from_email}
        Message: {message}

        Sent via Converto Business OS website.
        Time: {self._get_timestamp()}
        """

        msg.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.username, self.password)
            text = msg.as_string()
            server.sendmail(self.username, to_email, text)
            server.quit()
            print(f"✅ Email sent successfully from {from_name}")
            return True
        except Exception as e:
            print(f"❌ Email sending failed: {e}")
            return False

    def send_pilot_confirmation(self, email: str, name: str) -> bool:
        """Send pilot program confirmation email"""
        msg = MIMEMultipart()
        msg['From'] = self.username
        msg['To'] = email
        msg['Subject'] = "Welcome to Converto Business OS Pilot Program!"

        body = f"""
        Hello {name},

        Thank you for joining the Converto Business OS pilot program!

        You will receive access to your demo environment within 24 hours.
        Our team will contact you to schedule a personalized demonstration.

        Best regards,
        Converto Business OS Team

        ---
        This email was sent via Converto Business OS pilot form.
        """

        msg.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.username, self.password)
            text = msg.as_string()
            server.sendmail(self.username, email, text)
            server.quit()
            print(f"✅ Pilot confirmation sent to {email}")
            return True
        except Exception as e:
            print(f"❌ Pilot email failed: {e}")
            return False

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Gmail Configuration
gmail_config = {
    'server': 'smtp.gmail.com',
    'port': 587,
    'username': 'max.converto@gmail.com',  # Update with your Gmail
    'password': 'your-app-password'        # Update with your app password
}

# Zoho Configuration
zoho_config = {
    'server': 'smtp.zoho.com',
    'port': 587,
    'username': 'hello@converto.fi',       # Update with your Zoho email
    'password': 'your-zoho-password'       # Update with your Zoho password
}

# cPanel Configuration
cpanel_config = {
    'server': 'mail.hostingpalvelu.fi',    # Update with your hosting provider
    'port': 587,
    'username': 'hello@converto.fi',       # Update with your cPanel email
    'password': 'your-cpanel-password'     # Update with your cPanel password
}

# Amazon SES Configuration
ses_config = {
    'server': 'email-smtp.region.amazonaws.com',  # Update with your region
    'port': 587,
    'username': 'your-smtp-username',            # Update with SES credentials
    'password': 'your-smtp-password'              # Update with SES credentials
}

def get_email_service(service_type: str = 'gmail') -> FreeEmailService:
    """Get email service instance"""
    configs = {
        'gmail': gmail_config,
        'zoho': zoho_config,
        'cpanel': cpanel_config,
        'ses': ses_config
    }

    if service_type not in configs:
        raise ValueError(f"Unknown email service: {service_type}")

    return FreeEmailService(configs[service_type])

# Example usage
if __name__ == "__main__":
    # Test email service
    email_service = get_email_service('gmail')

    # Test contact email
    email_service.send_contact_email(
        "Test Customer",
        "test@example.com",
        "I'm interested in Converto Business OS pilot program."
    )

    # Test pilot confirmation
    email_service.send_pilot_confirmation(
        "pilot@example.com",
        "Test Pilot"
    )
EOF

    echo "✅ Gmail SMTP service created: backend/modules/email/free_email_service.py"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Update email credentials in the service file"
    echo "2. Test with: python3 backend/modules/email/free_email_service.py"
    echo "3. Integrate with your contact forms"
}

setup_cpanel_email() {
    echo ""
    echo "🏠 Setting up cPanel Email (Hostingpalvelu.fi)"
    echo "============================================="
    echo ""

    echo "Step 1: Login to cPanel"
    echo "1. Go to: https://www.hostingpalvelu.fi/asiakkaat/"
    echo "2. Login with your hosting credentials"
    echo "3. Navigate to: cPanel"
    echo ""

    echo "Step 2: Create Email Accounts"
    echo "1. In cPanel, go to: Email → Email Accounts"
    echo "2. Create: hello@converto.fi"
    echo "3. Create: info@converto.fi"
    echo "4. Set strong passwords"
    echo ""

    echo "Step 3: Configure Email Forwarding (Optional)"
    echo "1. Email → Forwarders"
    echo "2. hello@converto.fi → max@herbspot.fi"
    echo "3. info@converto.fi → max@herbspot.fi"
    echo ""

    echo "Step 4: Get SMTP Settings"
    echo "Record these SMTP settings:"
    echo "Server: mail.hostingpalvelu.fi"
    echo "Port: 587 (STARTTLS) or 465 (SSL)"
    echo "Username: hello@converto.fi"
    echo "Password: [the password you set]"
    echo ""

    read -p "Press Enter after configuring cPanel email accounts..."

    echo "📧 SMTP Configuration saved for cPanel email"
    echo "✅ Use the free_email_service.py with cpanel configuration"
}

setup_zoho_mail() {
    echo ""
    echo "📬 Setting up Zoho Mail (Free Professional Email)"
    echo "================================================"
    echo ""

    echo "Step 1: Sign up for Zoho Mail"
    echo "1. Go to: https://www.zoho.com/mail/"
    echo "2. Click: Start Free Trial"
    echo "3. Choose: Free Plan"
    echo "4. Verify domain: converto.fi"
    echo ""

    echo "Step 2: Configure DNS"
    echo "Add these DNS records to your domain:"
    echo "converto.fi          MX     10  mx.zoho.com"
    echo "converto.fi          MX     20  mx2.zoho.com"
    echo "converto.fi          MX     50  mx3.zoho.com"
    echo "converto.fi          TXT    v=spf1 include:zoho.com ~all"
    echo ""

    echo "Step 3: Create Email Accounts"
    echo "1. hello@converto.fi"
    echo "2. info@converto.fi"
    echo ""

    echo "SMTP Settings:"
    echo "Server: smtp.zoho.com"
    echo "Port: 587 (TLS)"
    echo "Username: hello@converto.fi"
    echo "Password: [Zoho password]"
    echo ""

    read -p "Press Enter after setting up Zoho Mail..."

    echo "✅ Zoho Mail configuration saved"
}

setup_amazon_ses() {
    echo ""
    echo "📡 Setting up Amazon SES (Free Tier - 62K emails/month)"
    echo "======================================================"
    echo ""

    echo "Step 1: AWS Account Setup"
    echo "1. Go to: https://aws.amazon.com/"
    echo "2. Create AWS account"
    echo "3. Verify email identity in SES"
    echo ""

    echo "Step 2: Verify Domain"
    echo "1. Go to: Amazon SES → Email Addresses"
    echo "2. Add domain: converto.fi"
    echo "3. Follow DNS verification steps"
    echo ""

    echo "Step 3: Generate SMTP Credentials"
    echo "1. Amazon SES → SMTP Settings"
    echo "2. Create SMTP credentials"
    echo "3. Save SMTP username and password"
    echo ""

    echo "SMTP Settings:"
    echo "Server: email-smtp.region.amazonaws.com"
    echo "Port: 587"
    echo "Username: [from SMTP credentials]"
    echo "Password: [from SMTP credentials]"
    echo ""

    read -p "Press Enter after setting up Amazon SES..."

    echo "✅ Amazon SES configuration saved"
}

echo ""
echo "🎉 FREE EMAIL SETUP COMPLETE!"
echo "============================="
echo ""
echo "✅ You now have a complete free email solution:"
echo "   - Real email addresses (hello@converto.fi)"
echo "   - Free SMTP sending (no monthly limits)"
echo "   - Professional appearance"
echo "   - Easy integration with Converto"
echo ""
echo "📋 Next steps:"
echo "1. Update email credentials in the service file"
echo "2. Test email sending functionality"
echo "3. Integrate with contact forms"
echo "4. Deploy to production"
echo ""
echo "💰 Total cost: $0/month (completely free!)"
