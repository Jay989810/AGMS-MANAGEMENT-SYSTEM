import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import { sendEmail, generateBroadcastEmail, generateBirthdayEmail } from '@/lib/email';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  try {
    const { type, recipients, subject, message, memberId } = await req.json();

    if (type === 'birthday' && memberId) {
      const member = await Member.findById(memberId);
      if (!member || !member.email) {
        return NextResponse.json(
          { error: 'Member not found or has no email' },
          { status: 404 }
        );
      }

      const html = generateBirthdayEmail(member.fullName);
      await sendEmail(member.email, 'Happy Birthday!', html);

      return NextResponse.json({ success: true, message: 'Birthday email sent' });
    }

    if (type === 'broadcast') {
      if (!subject || !message) {
        return NextResponse.json(
          { error: 'Subject and message are required' },
          { status: 400 }
        );
      }

      let emails: string[] = [];

      if (recipients === 'all') {
        const members = await Member.find({ email: { $exists: true, $ne: '' } });
        emails = members.map((m) => m.email!).filter(Boolean);
      } else if (recipients === 'active') {
        const members = await Member.find({
          membershipStatus: 'Active',
          email: { $exists: true, $ne: '' },
        });
        emails = members.map((m) => m.email!).filter(Boolean);
      } else if (Array.isArray(recipients)) {
        emails = recipients;
      }

      if (emails.length === 0) {
        return NextResponse.json(
          { error: 'No valid email addresses found' },
          { status: 400 }
        );
      }

      const html = generateBroadcastEmail(subject, message);

      // Send emails in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        await Promise.all(
          batch.map((email) => sendEmail(email, subject, html))
        );
      }

      return NextResponse.json({
        success: true,
        message: `Email sent to ${emails.length} recipients`,
      });
    }

    return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
  } catch (error: any) {
    console.error('Messaging error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);


