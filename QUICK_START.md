# 🚀 Quick Start Checklist

Follow these steps in order to get your Church Management System running.

## ✅ Step-by-Step Checklist

### 1. MongoDB Atlas (5 minutes)
- [ ] Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create FREE cluster (M0)
- [ ] Create database user (username + password)
- [ ] Whitelist IP: `0.0.0.0/0` (for development)
- [ ] Get connection string from "Connect" → "Connect your application"
- [ ] Replace `<username>` and `<password>` in connection string
- [ ] Add `/agcms` before the `?` in the connection string

**Result:** You'll have: `MONGODB_URI=mongodb+srv://user:pass@cluster.net/agcms?...`

---

### 2. JWT Secret (30 seconds)
- [ ] Open terminal/command prompt
- [ ] Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Copy the generated string

**Result:** You'll have: `JWT_SECRET=128-character-hex-string`

---

### 3. Gmail SMTP (3 minutes)
- [ ] Go to [myaccount.google.com/security](https://myaccount.google.com/security)
- [ ] Enable "2-Step Verification"
- [ ] Go to "App passwords"
- [ ] Create app password for "Mail" → "Other (Custom name)"
- [ ] Copy the 16-character password (remove spaces)
- [ ] Note your Gmail address

**Result:** You'll have:
- `SMTP_USER=your-email@gmail.com`
- `SMTP_PASS=16-character-app-password`

---

### 4. Vercel Blob Storage (5 minutes)
- [ ] Create account at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] In Vercel Dashboard → Settings → Storage → Create Blob Store
- [ ] Copy the `BLOB_READ_WRITE_TOKEN` from settings

**Result:** You'll have: `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx...`

---

### 5. Create .env.local File (2 minutes)
- [ ] In project root, create file: `.env.local`
- [ ] Copy this template and fill in your values:

```env
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=your-generated-jwt-secret-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=Amazing Grace Church <your-email@gmail.com>
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] Save the file

---

### 6. Install & Run (2 minutes)
- [ ] Open terminal in project directory
- [ ] Run: `npm install`
- [ ] Run: `npx tsx scripts/seed.ts` (creates admin account)
- [ ] Run: `npm run dev`
- [ ] Open browser: [http://localhost:3000](http://localhost:3000)

---

### 7. First Login
- [ ] Go to login page
- [ ] Email: `admin@amazinggrace.com`
- [ ] Password: `admin123`
- [ ] **⚠️ CHANGE PASSWORD IMMEDIATELY AFTER LOGIN!**

---

## 🎉 You're Done!

Your Church Management System is now running locally!

---

## 📖 Need Detailed Instructions?

See `SETUP_GUIDE.md` for comprehensive step-by-step guides with screenshots and troubleshooting.

## 🔒 Security Reminders

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Change default admin password immediately
- ✅ Use strong JWT secret (128+ characters)
- ✅ For production, limit MongoDB IP access

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check username/password, verify IP whitelist |
| Gmail login failed | Use App Password, not regular password |
| Blob upload failed | Verify token format, check Vercel dashboard |
| Can't seed database | Make sure MongoDB URI is correct |

---

**Total Time:** ~15-20 minutes for complete setup

