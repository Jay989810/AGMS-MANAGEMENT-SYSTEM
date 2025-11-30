import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import Family from '@/lib/models/Family';
import { sendEmail, generateBroadcastEmail, generateBirthdayEmail } from '@/lib/email';
import { sendSMS, formatPhoneNumberForSMS } from '@/lib/sms';
import { sendWhatsApp } from '@/lib/whatsapp';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import mongoose from 'mongoose';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  try {
    const { type, recipients, subject, message, memberId, channel } = await req.json();

    // Birthday message (email only for now)
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

    // Broadcast messages (Email, SMS, or WhatsApp)
    if (type === 'broadcast') {
      // Subject required only for email, not for SMS or WhatsApp
      if (channel === 'email' && !subject) {
        return NextResponse.json(
          { error: 'Subject is required for email messages' },
          { status: 400 }
        );
      }
      if (!message) {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        );
      }

      // Get recipient list
      let memberList: any[] = [];

      if (recipients === 'all') {
        // All members with email or phone
        memberList = await Member.find({
          $or: [
            { email: { $exists: true, $ne: '' } },
            { phone: { $exists: true, $ne: '' } }
          ]
        });
      } else if (recipients === 'active') {
        memberList = await Member.find({
          membershipStatus: 'Active',
          $or: [
            { email: { $exists: true, $ne: '' } },
            { phone: { $exists: true, $ne: '' } }
          ]
        });
      } else if (recipients === 'inactive') {
        memberList = await Member.find({
          membershipStatus: 'Inactive',
          $or: [
            { email: { $exists: true, $ne: '' } },
            { phone: { $exists: true, $ne: '' } }
          ]
        });
      } else if (recipients === 'visitors') {
        memberList = await Member.find({
          membershipStatus: 'Visitor',
          $or: [
            { email: { $exists: true, $ne: '' } },
            { phone: { $exists: true, $ne: '' } }
          ]
        });
      } else if (typeof recipients === 'object' && recipients.type === 'members' && Array.isArray(recipients.ids)) {
        // Specific member IDs
        const memberIds = recipients.ids.map((id: string) => new mongoose.Types.ObjectId(id));
        memberList = await Member.find({ 
          _id: { $in: memberIds },
          $or: [
            { email: { $exists: true, $ne: '' } },
            { phone: { $exists: true, $ne: '' } }
          ]
        });
      } else if (typeof recipients === 'object' && recipients.type === 'families' && Array.isArray(recipients.ids)) {
        // Family IDs - get all members from these families
        const familyIds = recipients.ids.map((id: string) => new mongoose.Types.ObjectId(id));
        const families = await Family.find({ _id: { $in: familyIds } }).populate('members');
        const allMemberIds: mongoose.Types.ObjectId[] = [];
        
        families.forEach((family: any) => {
          if (Array.isArray(family.members)) {
            family.members.forEach((member: any) => {
              if (member._id) {
                allMemberIds.push(new mongoose.Types.ObjectId(member._id));
              }
            });
          }
        });

        // Remove duplicates
        const uniqueMemberIds = Array.from(new Set(allMemberIds.map(id => id.toString())));
        
        memberList = await Member.find({ 
          _id: { $in: uniqueMemberIds.map(id => new mongoose.Types.ObjectId(id)) },
          $or: [
            { email: { $exists: true, $ne: '' } },
            { phone: { $exists: true, $ne: '' } }
          ]
        });
      } else if (Array.isArray(recipients)) {
        // Legacy support: array of member IDs
        const memberIds = recipients.map((id: string) => new mongoose.Types.ObjectId(id));
        memberList = await Member.find({ 
          _id: { $in: memberIds },
          $or: [
            { email: { $exists: true, $ne: '' } },
            { phone: { $exists: true, $ne: '' } }
          ]
        });
      }

      if (memberList.length === 0) {
        return NextResponse.json(
          { error: 'No valid recipients found' },
          { status: 400 }
        );
      }

      const channelType = channel || 'email'; // email, sms, whatsapp

      // Send via Email
      if (channelType === 'email') {
        const emails = memberList
          .map((m) => m.email)
          .filter((email) => email && email.trim() !== '');

        if (emails.length === 0) {
          return NextResponse.json(
            { error: 'No valid email addresses found' },
            { status: 400 }
          );
        }

        const html = generateBroadcastEmail(subject, message);

        // Send emails in batches to avoid rate limits
        const batchSize = 10;
        let sent = 0;
        for (let i = 0; i < emails.length; i += batchSize) {
          const batch = emails.slice(i, i + batchSize);
          await Promise.all(
            batch.map((email) => sendEmail(email, subject, html))
          );
          sent += batch.length;
        }

        return NextResponse.json({
          success: true,
          message: `Email sent to ${sent} recipients`,
          sent,
          total: emails.length,
        });
      }

      // Send via SMS
      if (channelType === 'sms') {
        const provider = (process.env.SMS_PROVIDER || 'bulksmsnigeria') as 'bulksmsnigeria' | 'twilio' | 'africas_talking' | 'termii';
        
        // Validate required environment variables based on provider
        if (provider === 'bulksmsnigeria') {
          // BulkSMS Nigeria v3/v2 API requires Bearer API token (in SMS_PASSWORD or SMS_API_KEY) and senderId
          // Trim whitespace and remove quotes if present (common .env issue)
          const rawToken = process.env.SMS_PASSWORD || process.env.SMS_API_KEY;
          const apiToken = rawToken?.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes
          
          if (!apiToken || !process.env.SMS_SENDER_ID) {
            const missingVars = [];
            if (!apiToken) missingVars.push('SMS_PASSWORD or SMS_API_KEY');
            if (!process.env.SMS_SENDER_ID) missingVars.push('SMS_SENDER_ID');
            
            console.error('Missing SMS configuration:', missingVars.join(', '));
            return NextResponse.json(
              { 
                error: `SMS configuration incomplete. Missing: ${missingVars.join(', ')}. Please check your .env.local file.`,
                errorMessage: `Missing environment variables: ${missingVars.join(', ')}. Please add these to your .env.local file.`
              },
              { status: 400 }
            );
          }
          
          // Validate token format (Bearer tokens are typically long alphanumeric strings)
          if (apiToken.length < 10) {
            console.error('API token appears to be too short. Bearer tokens are usually longer strings.');
            return NextResponse.json(
              { 
                error: 'API token appears invalid. Please verify your Bearer token from BulkSMS Nigeria dashboard.',
                errorMessage: 'Invalid API token format. Please check your SMS_PASSWORD in .env.local - it should be your Bearer token from the v3 API (no quotes needed).'
              },
              { status: 400 }
            );
          }
        }

        const smsConfig = {
          provider,
          apiKey: process.env.SMS_API_KEY?.trim().replace(/^["']|["']$/g, ''),
          // Clean the password/token: trim whitespace and remove surrounding quotes
          password: (process.env.SMS_PASSWORD || process.env.SMS_API_KEY)?.trim().replace(/^["']|["']$/g, ''), // API token for BulkSMS Nigeria
          accountSid: process.env.SMS_ACCOUNT_SID,
          authToken: process.env.SMS_AUTH_TOKEN,
          username: process.env.SMS_USERNAME, // Not required for BulkSMS Nigeria v2
          senderId: process.env.SMS_SENDER_ID, // This is the 'from' parameter
          from: process.env.SMS_FROM || process.env.SMS_SENDER_ID,
        };

        // Robust phone number extraction and validation
        const validPhones: string[] = [];
        const invalidPhones: { phone: string; member: string; reason: string }[] = [];
        
        // Process each member's phone number
        for (const member of memberList) {
          if (!member.phone || typeof member.phone !== 'string') {
            invalidPhones.push({
              phone: member.phone || 'N/A',
              member: member.fullName || 'Unknown',
              reason: 'Phone number is missing or invalid type'
            });
            continue;
          }
          
          const formatted = formatPhoneNumberForSMS(member.phone);
          if (formatted) {
            validPhones.push(formatted);
          } else {
            invalidPhones.push({
              phone: member.phone,
              member: member.fullName || 'Unknown',
              reason: 'Phone number format could not be parsed or converted'
            });
          }
        }

        if (validPhones.length === 0) {
          console.error('❌ No valid phone numbers found after formatting');
          console.error('   Invalid phones:', invalidPhones);
          return NextResponse.json(
            { 
              error: 'No valid phone numbers found',
              errorMessage: `Found ${memberList.length} members but none have valid phone numbers. ${invalidPhones.length > 0 ? `Invalid: ${invalidPhones.map(p => `${p.member} (${p.phone})`).join(', ')}` : ''}`,
              invalidPhones: invalidPhones.slice(0, 10) // Limit to first 10 for response size
            },
            { status: 400 }
          );
        }

        // Log phone number processing results
        console.log(`📱 Phone number processing: ${validPhones.length} valid, ${invalidPhones.length} invalid`);
        if (invalidPhones.length > 0) {
          console.warn('⚠️ Invalid phone numbers:', invalidPhones.slice(0, 5));
        }

        // Format message for SMS (NO subject - SMS doesn't support subject field, only body)
        // SMS should only contain the message body, not subject
        // Note: The formatPhoneNumberForSMS function will handle formatting in the SMS service
        const smsMessages = validPhones.map((phone) => ({
          to: phone, // Already formatted by formatPhoneNumberForSMS
          message: message.substring(0, 160), // SMS character limit (160 chars per SMS)
        }));

        let result;
        try {
          result = await sendSMS(smsMessages, smsConfig);
        } catch (smsError: any) {
          console.error('SMS sending error:', smsError);
          return NextResponse.json(
            { 
              error: smsError.message || 'Failed to send SMS. Please check your SMS configuration.',
              errorMessage: smsError.message || 'Failed to send SMS. Please verify your SMS credentials in .env.local'
            },
            { status: 500 }
          );
        }

        // Log errors to console for debugging
        if (result.errors && result.errors.length > 0) {
          console.error('SMS Sending Errors:', JSON.stringify(result.errors, null, 2));
        }

        // Log the action
        await logActionFromRequest(
          user,
          AuditActions.SEND_SMS,
          'Message',
          {
            entityName: `SMS: ${subject}`,
            details: {
              recipients: validPhones.length,
              sent: result.success,
              failed: result.failed,
              provider: 'bulksmsnigeria',
              message: message.substring(0, 100), // First 100 chars
              errors: result.errors,
            },
            ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
            userAgent: req.headers.get('user-agent') || undefined,
          }
        );

        // Build error message for user
        let errorMessage = '';
        if (result.errors && result.errors.length > 0) {
          const firstError = result.errors[0];
          if (firstError.message) {
            errorMessage = firstError.message;
          } else if (typeof firstError.error === 'string') {
            errorMessage = firstError.error;
          } else if (firstError.error && firstError.error.message) {
            errorMessage = firstError.error.message;
          } else {
            errorMessage = JSON.stringify(firstError.error || firstError);
          }
        }

        return NextResponse.json({
          success: result.success > 0,
          message: result.success > 0 
            ? `SMS sent to ${result.success} recipients${result.failed > 0 ? `, ${result.failed} failed` : ''}`
            : `Failed to send SMS: ${errorMessage || 'Unknown error'}`,
          sent: result.success,
          failed: result.failed,
          total: validPhones.length,
          errors: result.errors,
          errorMessage: errorMessage || undefined,
        });
      }

      // Send via WhatsApp
      if (channelType === 'whatsapp') {
        const whatsappConfig = {
          provider: (process.env.WHATSAPP_PROVIDER || 'twilio_whatsapp') as 'whatsapp_business' | 'twilio_whatsapp' | '360dialog' | 'chatapi',
          apiKey: process.env.WHATSAPP_API_KEY,
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
          accountSid: process.env.WHATSAPP_ACCOUNT_SID,
          authToken: process.env.WHATSAPP_AUTH_TOKEN,
          from: process.env.WHATSAPP_FROM,
        };

        const phones = memberList
          .map((m) => m.phone)
          .filter((phone) => phone && phone.trim() !== '');

        if (phones.length === 0) {
          return NextResponse.json(
            { error: 'No valid phone numbers found' },
            { status: 400 }
          );
        }

        const whatsappMessages = phones.map((phone) => ({
          to: phone,
          message: `${subject}\n\n${message}`,
          type: 'text' as const,
        }));

        const result = await sendWhatsApp(whatsappMessages, whatsappConfig);

        // Log the action
        await logActionFromRequest(
          user,
          AuditActions.SEND_WHATSAPP,
          'Message',
          {
            entityName: `WhatsApp: ${subject}`,
            details: {
              recipients: phones.length,
              sent: result.success,
              failed: result.failed,
              message: message.substring(0, 100), // First 100 chars
            },
            ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
            userAgent: req.headers.get('user-agent') || undefined,
          }
        );

        return NextResponse.json({
          success: result.success > 0,
          message: `WhatsApp message sent to ${result.success} recipients, ${result.failed} failed`,
          sent: result.success,
          failed: result.failed,
          total: phones.length,
          errors: result.errors,
        });
      }

      return NextResponse.json({ error: 'Invalid channel type' }, { status: 400 });
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
