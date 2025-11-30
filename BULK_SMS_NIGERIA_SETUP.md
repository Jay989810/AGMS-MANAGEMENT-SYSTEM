# Bulk SMS Nigeria - Step-by-Step Setup Guide

This guide will help you set up Bulk SMS Nigeria for sending text messages to your church members.

## 🎯 Why Bulk SMS Nigeria?

- ✅ **Optimized for Nigeria**: Works best with Nigerian phone numbers
- ✅ **Affordable**: Competitive rates for Nigerian networks
- ✅ **Reliable**: High delivery rates within Nigeria
- ✅ **Easy Setup**: Simple API integration

---

## 📋 Step 1: Choose a Provider

### Recommended Providers:

1. **eBulkSMS** (https://www.ebulksms.com)
   - Most popular in Nigeria
   - Good API documentation
   - Reliable delivery

2. **BulkSMSNigeria** (https://www.bulksmsnigeria.com)
   - Simple interface
   - Good customer support
   - Competitive pricing

3. **Nigeria Bulk SMS** (https://nigeriabulksms.com)
   - Flexible API
   - Multiple payment options

**For this guide, we'll use eBulkSMS (most common)**

---

## 📋 Step 2: Create Account

### 2.1 Sign Up
1. Go to https://www.ebulksms.com
2. Click **"Sign Up"** or **"Register"**
3. Fill in your details:
   - Full Name
   - Email Address
   - Phone Number
   - Password
   - Organization (your church name)

### 2.2 Verify Email
1. Check your email inbox
2. Click the verification link
3. Complete email verification

### 2.3 Activate Account
1. Log in to your account
2. Some providers require account activation
3. May need to upload identification (for business accounts)
4. Wait for approval (usually instant or 24 hours)

---

## 📋 Step 3: Get Your Credentials

### 3.1 Get Username and API Key
1. Log into your eBulkSMS dashboard
2. Go to **"API"** or **"Settings"** → **"API Settings"**
3. You'll find:
   - **Username**: Your account username (or email)
   - **API Key**: Your API key/password (click "Generate" if needed)
   - **Sender ID**: Your approved sender ID

### 3.2 Get/Request Sender ID
1. Go to **"Sender ID"** or **"Settings"** → **"Sender ID"**
2. Request a sender ID:
   - Use your church name (e.g., "CHURCH", "GRACECHURCH", "AMAZINGGRACE")
   - Must be 11 characters or less
   - May need approval (can take 1-3 days)
   - Can use default initially if available

**Example Sender IDs:**
- ✅ "CHURCH" (good)
- ✅ "GRACECH" (good)
- ✅ "AMAZING" (good)
- ❌ "AMAZING GRACE CHURCH" (too long)

### 3.3 Add Credits
1. Go to **"Buy Credits"** or **"Top Up"**
2. Choose amount (e.g., ₦5,000, ₦10,000)
3. Pay via bank transfer, card, or other methods
4. Credits will be added to your account

**Note:** Typical cost is ₦2-₦3 per SMS in Nigeria

---

## 📋 Step 4: Configure Environment Variables

### 4.1 Open Your Project
1. Navigate to your project folder
2. Open the `.env.local` file (create if it doesn't exist)

### 4.2 Add SMS Configuration
Add these lines to your `.env.local` file:

```env
# SMS Configuration (Bulk SMS Nigeria - eBulkSMS)
SMS_PROVIDER=bulksmsnigeria
SMS_USERNAME=your_username_or_email
SMS_PASSWORD=your_api_key_here
SMS_SENDER_ID=CHURCH
```

**Replace:**
- `your_username_or_email` with your **eBulkSMS username or email**
- `your_api_key_here` with your **API key**
- `CHURCH` with your **approved sender ID**

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

# SMS Configuration (Bulk SMS Nigeria)
SMS_PROVIDER=bulksmsnigeria
SMS_USERNAME=yourname@email.com
SMS_PASSWORD=abc123xyz456def789
SMS_SENDER_ID=CHURCH
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

## 📋 Step 5: Prepare Member Phone Numbers

### 5.1 Phone Number Format
Nigerian phone numbers should be in this format:
- ✅ **Correct**: `08012345678` (local format - system will convert)
- ✅ **Correct**: `+2348012345678` (international format)
- ✅ **Correct**: `2348012345678` (without +)
- ❌ **Wrong**: `+08012345678` (wrong country code)

**The system automatically converts Nigerian numbers:**
- `080...` → `23480...`
- `070...` → `23470...`
- `081...` → `23481...`
- etc.

### 5.2 Update Member Phone Numbers
1. Go to your **Members** page in admin panel
2. Check member phone numbers
3. Ensure they're in correct format:
   - Local format: `08012345678` (preferred)
   - International: `+2348012345678` (also works)

**All major Nigerian networks supported:**
- MTN (0803, 0806, 0703, 0706, 0813, 0816, 0810, 0814, 0903, 0906)
- Airtel (0802, 0808, 0708, 0812, 0901, 0902, 0907)
- Glo (0805, 0807, 0705, 0815, 0811, 0905)
- 9mobile (0809, 0817, 0818, 0908, 0909)

---

## 📋 Step 6: Test SMS Messaging

### 6.1 Add Test Member
1. Go to **Members** → **Add Member**
2. Add yourself as a test member:
   - Name: Your Name
   - Phone: Your Nigerian phone number (e.g., `08012345678`)
   - Other details as needed

### 6.2 Send Test Message
1. Go to **Messaging** page
2. Select channel: **📱 SMS** (should be default now)
3. Select recipients: **All Members** (or just your test member)
4. Enter subject: `Test Message`
5. Enter message: `Hello! This is a test SMS from the church system.`
6. Click **Send Message**

### 6.3 Verify Delivery
1. Check your phone
2. You should receive the SMS
3. Check the result message in the admin panel (shows sent/failed counts)
4. Check eBulkSMS dashboard for delivery reports

---

## 📋 Step 7: Using SMS in Your System

### 7.1 Sending Bulk Messages
1. Navigate to **Messaging** page
2. Select **📱 SMS** channel (default)
3. Choose recipients:
   - **All Members**: Sends to everyone with a phone number
   - **Active Members Only**: Sends only to active members
4. Enter subject and message
5. Click **Send Message**

### 7.2 Message Best Practices
- **Keep messages concise**: SMS is limited to 160 characters per message
- **Use clear subjects**: Helps members understand the message
- **Don't spam**: Respect members' privacy
- **Include opt-out option**: "Reply STOP to unsubscribe"

### 7.3 Message Limits
- **Single SMS**: 160 characters
- **Long SMS**: Automatically split if longer (costs more)
- **Recommended**: Keep under 160 characters for cost efficiency

**Character Count Examples:**
- ✅ "Reminder: Sunday service at 9 AM. See you there!" (58 chars)
- ✅ "Weekly Bible Study: Tonight 7 PM. Topic: Faith. All welcome!" (67 chars)
- ❌ Very long messages will be split into multiple SMS (costs more)

---

## 💰 Costs & Credits

### Pricing
- **Typical Cost**: ₦2 - ₦3 per SMS in Nigeria
- **Example**: 100 messages = ₦200 - ₦300

### Managing Credits
1. Log into eBulkSMS dashboard
2. Check credit balance
3. Top up when running low
4. Set up low balance alerts

### Tips to Save Costs
- Keep messages short (under 160 chars)
- Send only important announcements
- Group multiple updates in one message
- Monitor usage regularly

---

## 🐛 Troubleshooting

### Problem: "Failed to send SMS messages"
**Solutions:**
1. ✅ Check your credentials in `.env.local`
2. ✅ Verify username and API key are correct
3. ✅ Check eBulkSMS dashboard for error messages
4. ✅ Ensure you have sufficient credits
5. ✅ Verify sender ID is approved

### Problem: "Messages not received"
**Solutions:**
1. ✅ Check if phone number is correct (Nigerian format)
2. ✅ Verify number belongs to Nigerian network
3. ✅ Check eBulkSMS dashboard → Reports for delivery status
4. ✅ Some networks may have delays (check after 5-10 minutes)

### Problem: "Invalid phone number format"
**Solutions:**
1. ✅ Use Nigerian format: `08012345678` or `+2348012345678`
2. ✅ System auto-converts local numbers (080...) to international (23480...)
3. ✅ Ensure phone number has 11 digits (excluding country code)

### Problem: "Sender ID not approved"
**Solutions:**
1. ✅ Wait for approval (can take 1-3 days)
2. ✅ Check eBulkSMS dashboard for approval status
3. ✅ Use a different sender ID if rejected
4. ✅ Contact eBulkSMS support for help

### Problem: "Insufficient credits"
**Solutions:**
1. ✅ Check credit balance in dashboard
2. ✅ Top up your account
3. ✅ Set up auto-top up if available

---

## ✅ Checklist

Before going live:

- [ ] eBulkSMS account created and verified
- [ ] API credentials obtained (username and API key)
- [ ] Sender ID requested and approved
- [ ] Credits added to account
- [ ] Credentials added to `.env.local`
- [ ] Server restarted after adding credentials
- [ ] Test message sent and received successfully
- [ ] Member phone numbers in correct format
- [ ] Small batch test (5-10 members) completed
- [ ] Delivery verified for test messages

---

## 📞 Need Help?

1. **eBulkSMS Support**: Check their support section or contact them
2. **API Documentation**: https://www.ebulksms.com/pages/api-docs
3. **Dashboard**: Check logs and reports in your eBulkSMS dashboard

---

## 🎉 You're All Set!

Once you've completed these steps, you can:
- ✅ Send SMS messages to church members
- ✅ Track delivery status
- ✅ Send bulk announcements
- ✅ Keep members informed instantly

**Next Steps:**
- Test with a small group first
- Monitor costs and credits
- Set up regular announcements
- Train staff on using the system

---

## 📱 Alternative: Using Termii (If eBulkSMS doesn't work)

If you prefer Termii instead:

1. Sign up at https://termii.com
2. Get API key from dashboard
3. Update `.env.local`:
   ```env
   SMS_PROVIDER=termii
   SMS_API_KEY=your_termii_api_key
   SMS_SENDER_ID=your_sender_id
   ```

Termii also works great for Nigeria and has similar setup process.

---

**Note:** Always test with a small batch before sending to all members!

