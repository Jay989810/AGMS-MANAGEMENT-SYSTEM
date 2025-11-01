# Amazing Grace Church Member Management System (AGCMS)

A modern full-stack web application for managing church membership data, built with Next.js 14, MongoDB, and TailwindCSS.

## Features

- 🔐 **Multi-Admin Authentication** - Role-based access (SUPER_ADMIN, ADMIN)
- 👥 **Member Management** - Complete CRUD operations with profile image uploads
- 📊 **Dashboard** - Key statistics and quick actions
- 📅 **Attendance Tracking** - Record and manage service attendance
- 🎂 **Birthday Tracker** - Track and send birthday emails
- 📧 **Messaging System** - Broadcast emails to members
- 🏢 **Department Management** - Organize members by ministries/departments

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **Storage**: Vercel Blob Storage (for profile images)
- **Email**: NodeMailer (Gmail SMTP)
- **Authentication**: JWT tokens
- **Deployment**: Vercel + MongoDB Atlas

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Vercel account (for blob storage)
- Gmail account (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   cd "CHURCH MANAGEMENT"
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agcms?retryWrites=true&w=majority

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # NodeMailer Gmail SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=Amazing Grace Church <your-email@gmail.com>

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

   # Next.js
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Seed the database**
   
   Create a super admin account:
   ```bash
   npx tsx scripts/seed.ts
   ```
   
   Default credentials:
   - Email: `admin@amazinggrace.com`
   - Password: `admin123`
   
   **⚠️ Change this password immediately after first login!**

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Setup Guide

### MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env.local`

### Vercel Blob Storage Setup

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link your project: `vercel link`
4. Get your blob token from Vercel dashboard
5. Add `BLOB_READ_WRITE_TOKEN` to `.env.local`

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
3. Use the generated password in `SMTP_PASS`

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── members/          # Member management pages
│   ├── attendance/       # Attendance pages
│   ├── departments/      # Department pages
│   ├── birthdays/        # Birthday tracker
│   ├── messaging/       # Messaging system
│   └── login/            # Login page
├── components/
│   ├── ui/               # Reusable UI components
│   └── Layout/           # Layout components
├── lib/
│   ├── models/           # Mongoose models
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── email.ts          # Email utilities
│   └── utils.ts          # Utility functions
└── scripts/
    └── seed.ts           # Database seed script
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your Vercel project settings:
- `MONGODB_URI`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

## Usage

### Creating Admin Accounts

Super admins can create new admin accounts via the API:
```bash
POST /api/admin/create
{
  "email": "newadmin@example.com",
  "password": "securepassword",
  "name": "Admin Name",
  "role": "ADMIN"
}
```

### Managing Members

- View all members: `/members`
- Add new member: `/members/new`
- Edit member: `/members/[id]/edit`
- View member details: `/members/[id]`

### Recording Attendance

- View all records: `/attendance`
- Record new attendance: `/attendance/new`

### Departments

- View and manage departments: `/departments`
- Departments can be assigned to members

### Birthdays

- View upcoming birthdays: `/birthdays`
- Filter by month or next 7 days
- Send birthday emails directly from the page

### Messaging

- Send broadcast emails: `/messaging`
- Choose recipients (all members or active only)
- HTML formatting supported

## Color Theme

- **Navy Blue**: `#001F3F` (primary)
- **Gold**: `#FFB703` (accent)
- **White**: Background

## License

This project is for internal use by Amazing Grace Baptist Church.

## Support

For issues or questions, please contact the development team.


