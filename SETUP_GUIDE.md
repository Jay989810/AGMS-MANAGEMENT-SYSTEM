# Complete Setup Guide - Step by Step

This guide will walk you through getting all the required credentials for your Church Management System.

---

## 📋 Table of Contents

1. [MongoDB Atlas Setup (MongoDB URI)](#1-mongodb-atlas-setup)
2. [JWT Secret Generation](#2-jwt-secret-generation)
3. [Gmail SMTP Setup](#3-gmail-smtp-setup)
4. [Vercel Blob Storage Setup](#4-vercel-blob-storage-setup)
5. [Putting It All Together](#5-putting-it-all-together)

---

## 1. MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Fill in your details and create an account
4. Verify your email address

### Step 2: Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** (Free tier) - Perfect for development
3. Choose a cloud provider (AWS, Google Cloud, or Azure)
4. Select a region closest to you (e.g., `us-east-1` for North America)
5. Click **"Create"** and wait 3-5 minutes for the cluster to be created

### Step 3: Create Database User

1. In the **"Security"** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `church_admin`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **IMPORTANT:** Copy and save this password - you'll need it!
7. Under **"Database User Privileges"**, select **"Atlas admin"** (or **"Read and write to any database"**)
8. Click **"Add User"**

### Step 4: Whitelist Your IP Address

1. In the **"Security"** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (this adds `0.0.0.0/0`)
   - ⚠️ **For production**, you should add only specific IPs for security
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Go back to **"Database"** section
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as the driver
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your database username
7. Replace `<password>` with your database password
8. Add your database name after the `.net/` part:
   ```
   mongodb+srv://church_admin:YourPassword123@cluster0.xxxxx.mongodb.net/agcms?retryWrites=true&w=majority
   ```

**Your MongoDB URI is ready!** It should look like:
```
MONGODB_URI=mongodb+srv://church_admin:YourPassword123@cluster0.xxxxx.mongodb.net/agcms?retryWrites=true&w=majority
```

---

## 2. JWT Secret Generation

A JWT secret is just a random string used to sign your authentication tokens. Here are easy ways to generate one:

### Option A: Using Node.js (Recommended)

1. Open your terminal/command prompt
2. Type this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. Copy the generated string (it will be 128 characters long)

### Option B: Using Online Generator

1. Go to [https://generate-secret.vercel.app/64](https://generate-secret.vercel.app/64)
2. Copy the generated secret

### Option C: Manual Generation

Use any random string generator or create your own strong password (at least 32 characters).

**Example JWT Secret:**
```
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8b3b3c8e8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8
```

---

## 3. Gmail SMTP Setup

### Step 1: Enable 2-Factor Authentication

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Under **"Signing in to Google"**, find **"2-Step Verification"**
3. Click on it and follow the steps to enable 2FA
   - You'll need your phone number
   - Google will send you a verification code

### Step 2: Generate App Password

1. After enabling 2FA, go back to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Under **"Signing in to Google"**, click **"App passwords"**
   - If you don't see this option, make sure 2FA is enabled first
3. Select **"Mail"** as the app
4. Select **"Other (Custom name)"** as the device
5. Type "Church Management System" or any name you prefer
6. Click **"Generate"**
7. **IMPORTANT:** Copy the 16-character password that appears (it will look like: `abcd efgh ijkl mnop`)
   - Remove the spaces when using it: `abcdefghijklmnop`
   - You won't be able to see this password again!

### Step 3: Get Your Gmail Address

Use the Gmail address you used to create the app password.

**Your SMTP credentials will be:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=Amazing Grace Church <your-email@gmail.com>
```

---

## 4. Vercel Blob Storage Setup

### Step 1: Create Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with GitHub, GitLab, or Bitbucket (recommended) or use email
4. Complete the verification process

### Step 2: Install Vercel CLI

1. Open your terminal/command prompt
2. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
   Or using yarn:
   ```bash
   yarn global add vercel
   ```

### Step 3: Login to Vercel

1. In your terminal, run:
   ```bash
   vercel login
   ```
2. Follow the prompts to authenticate

### Step 4: Link Your Project (Optional but Recommended)

1. Navigate to your project directory:
   ```bash
   cd "C:\Users\DELL\Desktop\CHURCH MANAGEMENT"
   ```
2. Link your project:
   ```bash
   vercel link
   ```
3. Follow the prompts:
   - Set up and deploy? **No** (for now)
   - Which scope? (choose your account)
   - Link to existing project? **No**
   - Project name? (e.g., `church-management`)
   - Directory? Press Enter (current directory)

### Step 5: Get Blob Storage Token

#### Option A: Via Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your account settings (top right) → **"Settings"**
3. Go to **"Storage"** → **"Blob"**
4. If you haven't created a blob store yet:
   - Click **"Create Database"** or **"Add Storage"**
   - Select **"Blob"**
   - Choose a name (e.g., `church-images`)
   - Select a region closest to you
   - Click **"Create"**
5. Click on your blob store
6. Go to **"Settings"** tab
7. Find **"Environment Variables"** or **"Connection String"**
8. Copy the **`BLOB_READ_WRITE_TOKEN`** value

#### Option B: Via Vercel CLI

1. Create a blob store:
   ```bash
   vercel blob create
   ```
2. Follow the prompts to create your store
3. The token will be displayed - copy it!

**Your Blob token will look like:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 5. Putting It All Together

### Step 1: Create `.env.local` File

1. In your project root directory (`C:\Users\DELL\Desktop\CHURCH MANAGEMENT`), create a file named `.env.local`
2. You can copy from `env.example` if it exists, or create a new file

### Step 2: Fill in All Values

Open `.env.local` and paste all your credentials:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://church_admin:YourPassword123@cluster0.xxxxx.mongodb.net/agcms?retryWrites=true&w=majority

# JWT Secret (use the one you generated)
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8b3b3c8e8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8

# NodeMailer Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=Amazing Grace Church <your-email@gmail.com>

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Verify Your File

Make sure:
- ✅ No spaces around the `=` sign
- ✅ No quotes around values (unless they contain spaces)
- ✅ File is named exactly `.env.local` (not `.env.local.txt`)
- ✅ File is in the root directory of your project

### Step 4: Test Your Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Seed the database:
   ```bash
   npx tsx scripts/seed.ts
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

5. Login with:
   - Email: `admin@amazinggrace.com`
   - Password: `admin123`

---

## 🔒 Security Checklist

- [ ] Changed default admin password after first login
- [ ] Used a strong JWT secret (at least 32 characters)
- [ ] Limited MongoDB IP access for production
- [ ] Used App Password for Gmail (not your regular password)
- [ ] Never committed `.env.local` to git (it's already in `.gitignore`)

---

## 🆘 Troubleshooting

### MongoDB Connection Issues

- **Error: "Authentication failed"**
  - Check your username and password in the connection string
  - Make sure special characters in password are URL-encoded

- **Error: "IP not whitelisted"**
  - Go to MongoDB Atlas → Network Access
  - Add your current IP address or use `0.0.0.0/0` for development

### Gmail SMTP Issues

- **Error: "Invalid login"**
  - Make sure you're using an App Password, not your regular password
  - Verify 2FA is enabled on your Google account

- **Error: "Less secure app access"**
  - Don't enable "Less secure apps" - use App Passwords instead

### Vercel Blob Issues

- **Error: "Invalid token"**
  - Make sure you copied the full token
  - Check that the token has `BLOB_READ_WRITE_TOKEN` prefix

- **Can't find Blob Storage**
  - Make sure you're on a paid Vercel plan OR
  - Use the free tier which includes limited blob storage

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [Vercel Blob Storage Docs](https://vercel.com/docs/storage/vercel-blob)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## ✅ Quick Reference

| Credential | Where to Get It | Example Format |
|-----------|----------------|----------------|
| MongoDB URI | MongoDB Atlas → Connect → Connect your application | `mongodb+srv://user:pass@cluster.net/db` |
| JWT Secret | Generate using Node.js or online generator | `a8f5f167f44f4964e6c998dee827110c...` |
| SMTP User | Your Gmail address | `your-email@gmail.com` |
| SMTP Pass | Google Account → App Passwords | `abcdefghijklmnop` |
| Blob Token | Vercel Dashboard → Storage → Blob → Settings | `vercel_blob_rw_xxxxx...` |

---

**Need Help?** If you get stuck at any step, refer to the error messages and check the troubleshooting section above.

