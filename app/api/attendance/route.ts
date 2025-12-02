import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Attendance from '@/lib/models/Attendance';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import { parseDeviceInfo, formatDeviceInfo } from '@/lib/device-info';
import mongoose from 'mongoose';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    // Optimize: Use lean() for faster queries and limit results
    const attendances = await Attendance.find()
      .select('eventName date totalPresent notes')
      .sort({ date: -1 })
      .limit(100)
      .lean();
    
    // Log view action
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const deviceInfo = parseDeviceInfo(userAgent);
    
    await logActionFromRequest(
      user,
      AuditActions.VIEW_ATTENDANCES,
      'Attendance',
      {
        details: {
          resultCount: attendances.length,
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
    
    return NextResponse.json({ attendances });
  }

  if (req.method === 'POST') {
    const data = await req.json();
    const attendance = new Attendance(data);
    await attendance.save();
    
    // Log create action
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const deviceInfo = parseDeviceInfo(userAgent);
    
    await logActionFromRequest(
      user,
      AuditActions.CREATE_ATTENDANCE,
      'Attendance',
      {
        entityId: (attendance._id as mongoose.Types.ObjectId).toString(),
        entityName: attendance.eventName || `Attendance on ${attendance.date}`,
        details: {
          eventName: attendance.eventName,
          date: attendance.date,
          totalPresent: attendance.totalPresent,
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
    
    return NextResponse.json({ attendance }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);


