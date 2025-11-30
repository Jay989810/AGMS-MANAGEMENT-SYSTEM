# PWA, SMS, and WhatsApp Setup Guide

## 📱 Progressive Web App (PWA) Setup

### What is PWA?
A Progressive Web App allows users to install your website as an app on their Android/iOS device directly from Chrome/Safari. It works offline and provides an app-like experience.

### How to Install
1. Open the website in Chrome (Android) or Safari (iOS)
2. Look for the install prompt that appears, OR
3. Click the menu (3 dots) → "Install app" or "Add to Home Screen"
4. The app will install and appear on your home screen

### Features Enabled
- ✅ Installable on Android/iOS
- ✅ Offline access to cached pages
- ✅ App-like experience (no browser UI)
- ✅ Fast loading (cached resources)
- ✅ Background sync when connection restored

### Icon Files Required
You need to create and add these icon files to the `/public` folder:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

**Quick Icon Creation:**
- Use any image editor or online tool
- Create square images with your church logo
- Save as PNG format
- Recommended: Use your church logo on a navy blue background

## 📱 SMS Setup

### Supported Providers

#### 1. Twilio (Recommended - Global)
**Best for:** Worldwide coverage, reliable delivery

**Setup:**
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Add to `.env.local`:
```env
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your_account_sid
SMS_AUTH_TOKEN=your_auth_token
SMS_FROM=+1234567890  # Your Twilio phone number
```

**Pricing:** Pay-as-you-go, ~$0.0075 per SMS (varies by country)

---

#### 2. Africa's Talking (Best for Africa)
**Best for:** African countries, cheaper rates in Africa

**Setup:**
1. Sign up at https://africastalking.com
2. Get your API key and username
3. Add to `.env.local`:
```env
SMS_PROVIDER=africas_talking
SMS_API_KEY=your_api_key
SMS_USERNAME=your_username
SMS_SENDER_ID=your_sender_id  # Short code or alphanumeric
```

**Pricing:** Varies by country, typically cheaper in Africa

---

#### 3. Termii (Best for Nigeria/West Africa)
**Best for:** Nigeria and other West African countries

**Setup:**
1. Sign up at https://termii.com
2. Get your API key
3. Get a sender ID
4. Add to `.env.local`:
```env
SMS_PROVIDER=termii
SMS_API_KEY=your_api_key
SMS_SENDER_ID=your_sender_id
```

**Pricing:** Pay-as-you-go, competitive rates in Nigeria

---

### SMS Character Limits
- Standard SMS: 160 characters
- Long SMS: 1600 characters (split into multiple messages)
- Cost increases with message length

### Testing SMS
1. Start with a test message to yourself
2. Check delivery status in provider dashboard
3. Verify message formatting

---

## 💬 WhatsApp Setup

### Important Notes
- WhatsApp Business API is the official way (requires Meta Business verification)
- Alternative providers (Twilio, 360dialog, etc.) are easier to set up
- Personal WhatsApp numbers won't work for bulk messaging

### Supported Providers

#### 1. Twilio WhatsApp (Easiest to Start)
**Best for:** Quick setup, global coverage

**Setup:**
1. Sign up at https://www.twilio.com
2. Enable WhatsApp in Twilio Console
3. Get your test number (starts with `whatsapp:+14155238886`)
4. For production: Request WhatsApp Business approval
5. Add to `.env.local`:
```env
WHATSAPP_PROVIDER=twilio_whatsapp
WHATSAPP_ACCOUNT_SID=your_account_sid
WHATSAPP_AUTH_TOKEN=your_auth_token
WHATSAPP_FROM=whatsapp:+1234567890
```

**Testing:** Free test number available, production requires approval

---

#### 2. WhatsApp Business API (Meta Official)
**Best for:** Official WhatsApp Business, no provider fees (only WhatsApp fees)

**Setup:**
1. Create a Meta Business Account
2. Verify your business
3. Apply for WhatsApp Business API access
4. Set up a WhatsApp Business Account
5. Get your Phone Number ID and Access Token
6. Add to `.env.local`:
```env
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

**Note:** This process can take several days/weeks for approval

---

#### 3. 360dialog (WhatsApp Business API Provider)
**Best for:** Easier than direct Meta API, good support

**Setup:**
1. Sign up at https://360dialog.com
2. Connect your WhatsApp Business Account
3. Get your API key
4. Add to `.env.local`:
```env
WHATSAPP_PROVIDER=360dialog
WHATSAPP_API_KEY=your_api_key
```

**Pricing:** Check 360dialog pricing (usually per conversation)

---

#### 4. ChatAPI (Alternative)
**Best for:** Simple setup, good for smaller operations

**Setup:**
1. Sign up at https://chat-api.com
2. Create an instance
3. Get your instance ID and API token
4. Scan QR code to connect your WhatsApp
5. Add to `.env.local`:
```env
WHATSAPP_PROVIDER=chatapi
WHATSAPP_API_KEY=your_instance_id  # Format: instance_id:api_token
```

**Note:** This uses your personal WhatsApp number, limited scalability

---

### WhatsApp Message Types

**Text Messages:**
- Simple text (free)
- Up to 4096 characters
- Supports basic formatting

**Template Messages:**
- Required for unsolicited messages (outside 24-hour window)
- Must be pre-approved by WhatsApp
- Use for notifications, reminders

**24-Hour Window:**
- After a user messages you, you can reply freely for 24 hours
- No template needed within this window

---

## 🔧 Environment Variables Summary

Add all required variables to your `.env.local` file:

```env
# Email (Already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Church Name <your_email@gmail.com>"

# SMS Configuration (Choose one provider)
SMS_PROVIDER=twilio  # or africas_talking, termii
SMS_ACCOUNT_SID=your_account_sid  # For Twilio
SMS_AUTH_TOKEN=your_auth_token  # For Twilio
SMS_API_KEY=your_api_key  # For Africa's Talking/Termii
SMS_USERNAME=your_username  # For Africa's Talking
SMS_SENDER_ID=your_sender_id  # For all providers
SMS_FROM=+1234567890  # For Twilio

# WhatsApp Configuration (Choose one provider)
WHATSAPP_PROVIDER=twilio_whatsapp  # or whatsapp_business, 360dialog, chatapi
WHATSAPP_ACCOUNT_SID=your_account_sid  # For Twilio
WHATSAPP_AUTH_TOKEN=your_auth_token  # For Twilio
WHATSAPP_API_KEY=your_api_key  # For 360dialog/ChatAPI
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id  # For WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token  # For WhatsApp Business API
WHATSAPP_FROM=whatsapp:+1234567890  # For Twilio
```

---

## 🚀 Using the Messaging Feature

1. Go to **Messaging** page in the admin panel
2. Select channel: **Email**, **SMS**, or **WhatsApp**
3. Choose recipients: **All Members** or **Active Members Only**
4. Enter subject and message
5. Click **Send Message**

### Tips:
- **Email**: Best for long messages, HTML formatting
- **SMS**: Best for short, urgent messages (160 chars recommended)
- **WhatsApp**: Best for personal touch, longer messages

### Cost Considerations:
- **Email**: Usually free (Gmail) or very cheap
- **SMS**: Costs per message ($0.005-$0.05 depending on provider/country)
- **WhatsApp**: Costs per conversation (varies by provider)

---

## 🧪 Testing

### Test Before Bulk Sending
1. Create a test member with your phone number
2. Send a test message
3. Verify delivery
4. Check formatting
5. Then proceed with bulk sending

### Rate Limits
- Most providers have rate limits
- Messages are sent in batches automatically
- Large lists may take several minutes

---

## ⚠️ Important Notes

1. **Compliance**: Ensure you have consent from members to send messages
2. **Opt-out**: Provide a way for members to opt-out
3. **Costs**: Monitor usage and costs regularly
4. **Privacy**: Phone numbers are sensitive data - handle securely
5. **Spam**: Don't send too frequently to avoid being marked as spam

---

## 🆘 Troubleshooting

### SMS Not Sending
- Check API credentials are correct
- Verify phone number format (include country code, e.g., +234...)
- Check provider dashboard for errors
- Ensure sufficient credits/balance

### WhatsApp Not Working
- Verify WhatsApp Business API approval (if using official API)
- Check QR code connection (if using ChatAPI)
- Ensure phone numbers include country code
- Check 24-hour message window rules

### Messages Not Received
- Check spam/junk folders (email)
- Verify phone numbers are correct
- Check provider delivery logs
- Ensure provider account is active

---

## 📚 Additional Resources

- Twilio Documentation: https://www.twilio.com/docs
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Africa's Talking: https://developers.africastalking.com
- Termii: https://developers.termii.com

---

**Need Help?** Check the provider documentation or contact support for your chosen provider.

