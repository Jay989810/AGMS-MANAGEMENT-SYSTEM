# WhatsApp Integration - Step-by-Step Setup Guide

This guide will walk you through setting up WhatsApp messaging for your church management system.

## 🎯 Quick Overview

We'll be using **Twilio WhatsApp** (easiest option) which allows you to:
- Send WhatsApp messages to church members in bulk
- Use a test number for development (free)
- Upgrade to production number later
- Track delivery status

---

## 📋 Prerequisites

- Twilio account (free to sign up)
- Access to your church admin panel
- Member phone numbers in your database (with country code, e.g., +234...)

---

## 🔧 Step 1: Create Twilio Account

### 1.1 Sign Up
1. Go to https://www.twilio.com/try-twilio
2. Click "Sign Up" or "Get Started Free"
3. Fill in your details:
   - Email address
   - Password
   - Name
   - Phone number (for verification)

### 1.2 Verify Your Phone
1. Twilio will send you a verification code
2. Enter the code when prompted
3. Complete your account setup

### 1.3 Get Free Credits
- Twilio gives you free trial credits ($15.50)
- This is enough to test and send several messages
- You'll need to add payment method later for production use

---

## 🔧 Step 2: Enable WhatsApp on Twilio

### 2.1 Navigate to WhatsApp
1. Log into your Twilio Console: https://console.twilio.com
2. In the left sidebar, look for **"Messaging"** or **"Try it out"**
3. Click on **"Try it out"** → **"Send a WhatsApp message"**

### 2.2 Join Sandbox
1. You'll see a WhatsApp sandbox number (usually `+14155238886`)
2. You'll see a join code (like `join <code>`)
3. Send this join code to the sandbox number from YOUR WhatsApp
   - Example: If code is "church", send "join church" to +14155238886
4. You'll get a confirmation message when joined

### 2.3 Test WhatsApp
1. In Twilio Console, go to **"Try it out"** → **"Send a WhatsApp message"**
2. Send a test message to your own WhatsApp number
3. Verify you receive it

**Note:** Sandbox number can only send to verified WhatsApp numbers (numbers you've joined with)

---

## 🔧 Step 3: Get Your Twilio Credentials

### 3.1 Get Account SID and Auth Token
1. In Twilio Console, go to **Account** → **Account Info** (or check the dashboard)
2. You'll see:
   - **Account SID**: Starts with "AC..." (e.g., `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token**: Click "View" to reveal it (e.g., `your_auth_token_here`)

**⚠️ Important:** Keep these credentials SECRET. Never share them or commit to git.

### 3.2 Get WhatsApp Number
- Your sandbox number: `whatsapp:+14155238886` (for testing)
- For production: You'll need to request a WhatsApp Business number (takes approval)

---

## 🔧 Step 4: Configure Environment Variables

### 4.1 Open Your Project
1. Navigate to your project folder
2. Open the `.env.local` file (create it if it doesn't exist)

### 4.2 Add WhatsApp Configuration
Add these lines to your `.env.local` file:

```env
# WhatsApp Configuration (Twilio)
WHATSAPP_PROVIDER=twilio_whatsapp
WHATSAPP_ACCOUNT_SID=YOUR_ACCOUNT_SID_HERE
WHATSAPP_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM=whatsapp:+14155238886
```

**Replace:**
- `YOUR_ACCOUNT_SID_HERE` with your **Account SID**
- `your_auth_token_here` with your **Auth Token**
- `+14155238886` with your sandbox number (or production number later)

### 4.3 Example `.env.local` File
Your complete `.env.local` might look like:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/church_db

# JWT Secret
JWT_SECRET=your-secret-key-here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Church Name <your-email@gmail.com>"

# WhatsApp (Twilio)
WHATSAPP_PROVIDER=twilio_whatsapp
WHATSAPP_ACCOUNT_SID=YOUR_ACCOUNT_SID_HERE
WHATSAPP_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM=whatsapp:+14155238886
```

### 4.4 Save and Restart
1. Save the `.env.local` file
2. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

---

## 🔧 Step 5: Prepare Member Phone Numbers

### 5.1 Phone Number Format
WhatsApp requires phone numbers in international format:
- ✅ **Correct**: `+2348012345678` (Nigeria)
- ✅ **Correct**: `+1234567890` (US)
- ❌ **Wrong**: `08012345678` (missing country code)
- ❌ **Wrong**: `2348012345678` (missing + sign)

### 5.2 Update Member Phone Numbers
1. Go to your **Members** page in admin panel
2. Check member phone numbers
3. Update any that don't have country codes
4. Format: `+[country code][number]`

**Country Codes Examples:**
- Nigeria: `+234`
- USA: `+1`
- UK: `+44`
- Ghana: `+233`

---

## 🔧 Step 6: Test WhatsApp Messaging

### 6.1 Add Test Member
1. Go to **Members** → **Add Member**
2. Add yourself as a test member:
   - Name: Your Name
   - Phone: Your WhatsApp number (with country code, e.g., `+2348012345678`)
   - Other details as needed

### 6.2 Send Test Message
1. Go to **Messaging** page
2. Select channel: **💬 WhatsApp**
3. Select recipients: **All Members** (or just your test member)
4. Enter subject: `Test Message`
5. Enter message: `Hello! This is a test WhatsApp message from the church system.`
6. Click **Send Message**

### 6.3 Verify Delivery
1. Check your WhatsApp
2. You should receive the message
3. Check the result message in the admin panel (shows sent/failed counts)

---

## 🔧 Step 7: Production Setup (Optional - Later)

### 7.1 Request WhatsApp Business Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Or go to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Click **"Request a WhatsApp sender"** or **"Get a WhatsApp Business number"**
4. Fill in business details:
   - Business name: Your church name
   - Business type: Non-profit / Religious Organization
   - Website: Your church website
   - Description: Brief description of your church
5. Submit for approval (can take 1-3 days)

### 7.2 Update Configuration
Once approved, update `.env.local`:
```env
WHATSAPP_FROM=whatsapp:+1234567890  # Your new production number
```

---

## 📱 Step 8: Using WhatsApp in Your System

### 8.1 Sending Bulk Messages
1. Navigate to **Messaging** page
2. Select **💬 WhatsApp** channel
3. Choose recipients:
   - **All Members**: Sends to everyone with a phone number
   - **Active Members Only**: Sends only to active members
4. Enter subject and message
5. Click **Send Message**

### 8.2 Message Best Practices
- **Keep messages concise**: WhatsApp is for brief communications
- **Use clear subjects**: Helps recipients understand the message
- **Don't spam**: Respect members' privacy
- **Include opt-out option**: "Reply STOP to unsubscribe"

### 8.3 Message Limits
- **Sandbox**: Can only send to verified numbers (numbers you've joined with)
- **Production**: Can send to any valid WhatsApp number
- **Rate Limits**: Twilio has rate limits (handled automatically by the system)

---

## 🐛 Troubleshooting

### Problem: "Failed to send WhatsApp messages"
**Solutions:**
1. ✅ Check your credentials in `.env.local`
2. ✅ Verify phone numbers have country code (e.g., `+234...`)
3. ✅ Check Twilio Console for error messages
4. ✅ Ensure you've joined the sandbox (Step 2.2)
5. ✅ Verify your Twilio account has credits

### Problem: "Messages not received"
**Solutions:**
1. ✅ Check if phone number is correct
2. ✅ Verify number has WhatsApp account
3. ✅ Check if number is verified in sandbox (for testing)
4. ✅ Look at Twilio Console → Logs for delivery status

### Problem: "Unauthorized" error
**Solutions:**
1. ✅ Double-check Account SID and Auth Token
2. ✅ Ensure no extra spaces in `.env.local`
3. ✅ Restart your server after changing `.env.local`

### Problem: "Invalid phone number format"
**Solutions:**
1. ✅ Phone numbers MUST include country code
2. ✅ Format: `+[country code][number]`
3. ✅ Example: `+2348012345678` (not `08012345678`)

---

## 💰 Costs & Billing

### Testing (Sandbox)
- **Free**: Sandbox testing is free
- **Limited**: Can only send to verified numbers

### Production
- **Cost per message**: ~$0.005 - $0.02 per message (varies by country)
- **Example**: 100 messages = $0.50 - $2.00
- **Billing**: Twilio charges monthly based on usage

### Tips to Save Costs
- Send only important announcements
- Group multiple updates in one message
- Use email for longer content (free)
- Monitor usage in Twilio Console

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to git**
   - Already in `.gitignore` (should be)
   - Never share credentials publicly

2. **Rotate credentials regularly**
   - Change Auth Token every 90 days
   - Use strong passwords

3. **Monitor usage**
   - Check Twilio Console regularly
   - Set up billing alerts

4. **Member consent**
   - Ensure members consent to WhatsApp messages
   - Provide opt-out mechanism

---

## ✅ Checklist

Before going live:

- [ ] Twilio account created and verified
- [ ] WhatsApp sandbox joined and tested
- [ ] Credentials added to `.env.local`
- [ ] Server restarted after adding credentials
- [ ] Test message sent and received successfully
- [ ] Member phone numbers updated with country codes
- [ ] Small batch test (5-10 members) completed
- [ ] Delivery verified for test messages
- [ ] Production number requested (if needed)

---

## 📞 Need Help?

1. **Twilio Documentation**: https://www.twilio.com/docs/whatsapp
2. **Twilio Support**: https://support.twilio.com
3. **Check Twilio Console**: Look at Logs for detailed error messages

---

## 🎉 You're All Set!

Once you've completed these steps, you can:
- Send WhatsApp messages to church members
- Track delivery status
- Send bulk announcements
- Keep members informed instantly

**Next Steps:**
- Test with a small group first
- Monitor costs and usage
- Request production number when ready
- Set up member consent system

---

**Note:** For production use, consider requesting a WhatsApp Business number from Twilio for better deliverability and no sandbox restrictions.

