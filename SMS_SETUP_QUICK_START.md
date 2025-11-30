# SMS Setup - Quick Start Guide (Bulk SMS Nigeria)

## ⚡ Quick Setup (10 Minutes)

### Step 1: Sign Up (2 minutes)
1. Go to https://www.ebulksms.com
2. Click "Sign Up"
3. Fill form and verify email

### Step 2: Get Credentials (2 minutes)
1. Log in to dashboard
2. Go to **API Settings**
3. Copy:
   - Username (your email)
   - API Key
   - Request Sender ID (e.g., "CHURCH")

### Step 3: Add Credits (2 minutes)
1. Click **"Buy Credits"**
2. Add ₦5,000 or more
3. Pay via bank transfer/card

### Step 4: Configure (2 minutes)
Add to `.env.local`:
```env
SMS_PROVIDER=bulksmsnigeria
SMS_USERNAME=your_email@example.com
SMS_PASSWORD=your_api_key_here
SMS_SENDER_ID=CHURCH
```

### Step 5: Restart & Test (2 minutes)
1. Restart server: `npm run dev`
2. Go to **Messaging** page
3. Select **📱 SMS**
4. Send test message to yourself

**Done!** 🎉

---

## 📋 Full Details

See `BULK_SMS_NIGERIA_SETUP.md` for complete guide with troubleshooting.

---

## 💰 Cost

- **Per SMS**: ₦2 - ₦3
- **Example**: 100 messages = ₦200 - ₦300

---

## ✅ Testing Checklist

- [ ] Account created
- [ ] API credentials obtained
- [ ] Sender ID approved
- [ ] Credits added
- [ ] `.env.local` configured
- [ ] Server restarted
- [ ] Test message sent
- [ ] Message received

---

**Need help?** See `BULK_SMS_NIGERIA_SETUP.md` for detailed instructions.

