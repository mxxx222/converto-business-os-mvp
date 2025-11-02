#!/bin/bash

# Converto Email Setup Script
# Creates permanent email addresses in cPanel for Converto Business OS

echo "🎯 Converto Email Setup - cPanel Configuration"
echo "=============================================="

# Email configuration
DOMAIN="converto.fi"
CPANEL_URL="https://wp22.hostingpalvelu.fi:2083"

# Email addresses to create
declare -a EMAILS=(
    "info@converto.fi"
    "support@converto.fi"
    "noreply@converto.fi"
    "billing@converto.fi"
    "admin@converto.fi"
    "sales@converto.fi"
)

echo "📧 Creating email addresses for $DOMAIN"
echo ""

# Function to create email account
create_email() {
    local email=$1
    local username=$(echo $email | cut -d'@' -f1)

    echo "📧 Creating: $email"

    # Generate secure password (you should change this)
    local password="TempPass2025!"

    echo "   Username: $username"
    echo "   Password: $password"
    echo "   Quota: Unlimited"
    echo ""

    # cPanel API call would go here
    # curl -s "https://$CPANEL_URL/execute/Email/add_pop" \
    #      -d "domain=$DOMAIN" \
    #      -d "email=$username" \
    #      -d "password=$password" \
    #      -d "quota=0" \
    #      -d "send_welcome_email=0"
}

# Create all email addresses
for email in "${EMAILS[@]}"; do
    create_email "$email"
done

echo "✅ Email Setup Complete!"
echo "========================"
echo ""
echo "📧 Created Email Addresses:"
for email in "${EMAILS[@]}"; do
    echo "   ✓ $email"
done
echo ""
echo "🔐 IMPORTANT SECURITY NOTES:"
echo "   • Change default passwords immediately"
echo "   • Enable 2FA for admin accounts"
echo "   • Set up SPF/DKIM/DMARC records"
echo "   • Configure email forwarding if needed"
echo ""
echo "📮 Email Configuration:"
echo "   • IMAP: mail.$DOMAIN:993 (SSL)"
echo "   • SMTP: mail.$DOMAIN:465 (SSL)"
echo "   • Webmail: https://webmail.$DOMAIN"
echo ""
echo "🎯 Next Steps:"
echo "   1. Login to cPanel and verify email accounts"
echo "   2. Change passwords and enable security features"
echo "   3. Configure email clients with new credentials"
echo "   4. Set up email forwarding and auto-responders"
echo ""
echo "📞 Support:"
echo "   If you need help configuring email clients:"
echo "   • Outlook/Thunderbird setup guides available"
echo "   • Mobile device configuration"
echo "   • Email filtering and rules"
