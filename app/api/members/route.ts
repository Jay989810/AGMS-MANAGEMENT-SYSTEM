import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import { parseDeviceInfo, formatDeviceInfo } from '@/lib/device-info';
import mongoose from 'mongoose';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const ministry = searchParams.get('ministry') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (ministry) {
      query.ministry = ministry;
    }

    // Optimize: Limit results and select only needed fields
    const members = await Member.find(query)
      .select('fullName gender dateOfBirth phone email ministry membershipStatus maritalStatus lifeStatus familyId relationship profileImage createdAt')
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();
    
    // Log view action
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const deviceInfo = parseDeviceInfo(userAgent);
    
    await logActionFromRequest(
      user,
      AuditActions.VIEW_MEMBERS,
      'Member',
      {
        details: {
          searchQuery: search || null,
          ministryFilter: ministry || null,
          resultCount: members.length,
        },
        ipAddress,
        userAgent,
        deviceType: deviceInfo.deviceType,
        deviceName: deviceInfo.deviceName,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        deviceInfo: formatDeviceInfo(deviceInfo),
      }
    );
    
    return NextResponse.json({ members });
  }

  if (req.method === 'POST') {
    const data = await req.json();
    const member = new Member(data);
    await member.save();
    
    // Log the action
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const deviceInfo = parseDeviceInfo(userAgent);
    
    await logActionFromRequest(
      user,
      AuditActions.CREATE_MEMBER,
      'Member',
      {
        entityId: (member._id as mongoose.Types.ObjectId).toString(),
        entityName: member.fullName,
        details: {
          membershipStatus: member.membershipStatus,
          email: member.email,
          phone: member.phone,
        },
        ipAddress,
        userAgent,
        deviceType: deviceInfo.deviceType,
        deviceName: deviceInfo.deviceName,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        deviceInfo: formatDeviceInfo(deviceInfo),
      }
    );
    
    return NextResponse.json({ member }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);


