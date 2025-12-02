import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WeeklySelection from '@/lib/models/WeeklySelection';
import Member from '@/lib/models/Member';
import Family from '@/lib/models/Family';
import { sendSMS, SMSConfig } from '@/lib/sms';
import { sendEmail, generateBroadcastEmail } from '@/lib/email';
import { logActionFromRequest, AuditActions } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// Default weekly prayer message template
const DEFAULT_PRAYER_MESSAGE = `Dear {name},

We are honored to have you and your family as our Member/Family of the Week!

This week, we commit to praying specially for you and your household. We pray for:
- God's protection and guidance over your lives
- Divine favor in all your endeavors
- Health and strength for every member
- Unity and love in your family
- God's blessings and provision

May the Lord bless you abundantly this week and always.

Blessings,
Amazing Grace Church`;

function getWeekDates(date: Date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  return { start: monday, end: sunday, year: date.getFullYear(), weekNumber };
}

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const { channel, customMessage } = await req.json();
      const channelType = channel || 'sms';

      // Get current week's selection
      const weekDates = getWeekDates();
      const selection = await WeeklySelection.findOne({
        year: weekDates.year,
        weekNumber: weekDates.weekNumber,
      })
        .populate('memberId')
        .populate('familyId');

      if (!selection) {
        return NextResponse.json(
          { error: 'No member/family selected for this week' },
          { status: 404 }
        );
      }

      let recipients: any[] = [];
      let name = '';
      let phones: string[] = [];
      let emails: string[] = [];

      if (selection.selectionType === 'family' && selection.familyId) {
        const family = await Family.findById((selection.familyId as any)._id || selection.familyId)
          .populate('members');
        if (family) {
          name = family.familyName;
          const members = Array.isArray(family.members) ? family.members : [];
          recipients = members;
          phones = members
            .map((m: any) => m.phone)
            .filter((phone: string) => phone && phone.trim() !== '');
          emails = members
            .map((m: any) => m.email)
            .filter((email: string) => email && email.trim() !== '');
        }
      } else if (selection.selectionType === 'member' && selection.memberId) {
        const member = await Member.findById((selection.memberId as any)._id || selection.memberId);
        if (member) {
          name = member.fullName;
          recipients = [member];
          if (member.phone) phones.push(member.phone);
          if (member.email) emails.push(member.email);
        }
      }

      if (recipients.length === 0) {
        return NextResponse.json(
          { error: 'No recipients found for selected member/family' },
          { status: 400 }
        );
      }

      const message = (customMessage || DEFAULT_PRAYER_MESSAGE).replace(/{name}/g, name);
      const subject = `Member/Family of the Week - ${name}`;

      let sent = 0;
      let failed = 0;

      if (channelType === 'sms' && phones.length > 0) {
        const smsConfig: SMSConfig = {
          provider: (process.env.SMS_PROVIDER || 'bulksmsnigeria') as any,
          apiKey: process.env.SMS_API_KEY,
          password: process.env.SMS_PASSWORD || process.env.SMS_API_KEY,
          username: process.env.SMS_USERNAME,
          senderId: process.env.SMS_SENDER_ID,
        };

        const smsMessages = phones.map((phone) => ({
          to: phone,
          message: message.substring(0, 160),
        }));

        const result = await sendSMS(smsMessages, smsConfig);
        sent = result.success;
        failed = result.failed;
      } else if (channelType === 'email' && emails.length > 0) {
        const html = generateBroadcastEmail(subject, message);
        for (const email of emails) {
          try {
            await sendEmail(email, subject, html);
            sent++;
          } catch (error) {
            failed++;
          }
        }
      } else {
        return NextResponse.json(
          { error: `No valid ${channelType === 'sms' ? 'phone numbers' : 'email addresses'} found` },
          { status: 400 }
        );
      }

      // Mark prayer as sent - allow up to 2 sends per week
      const selectionId = (selection as any)._id?.toString() || selection.id?.toString() || '';
      const currentCount = (selection as any).prayerSentCount || 0;
      
      if (currentCount >= 2) {
        return NextResponse.json(
          { error: 'Prayer has already been sent 2 times this week. Maximum limit reached.' },
          { status: 400 }
        );
      }
      
      await WeeklySelection.findByIdAndUpdate(selectionId, { 
        prayerSent: true, // Keep for backward compatibility
        prayerSentCount: currentCount + 1 
      });

      // Log the action
      await logActionFromRequest(
        user,
        channelType === 'sms' ? AuditActions.SEND_SMS : AuditActions.SEND_EMAIL,
        'Weekly Prayer',
        {
          entityId: selectionId,
          entityName: `${selection.selectionType === 'family' ? 'Family' : 'Member'} of the Week: ${name}`,
          details: {
            selectionType: selection.selectionType,
            recipients: recipients.length,
            sent,
            failed,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: `Prayer sent to ${sent} recipient(s)${failed > 0 ? `, ${failed} failed` : ''}`,
        sent,
        failed,
        total: recipients.length,
      });
    } catch (error: any) {
      console.error('Error sending weekly prayer:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send prayer' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = requireAuth(handler);

