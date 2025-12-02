import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Sermon from '@/lib/models/Sermon';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import { parseDeviceInfo, formatDeviceInfo } from '@/lib/device-info';
import mongoose from 'mongoose';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    // Optimize: Limit results and use lean() for faster queries
    const sermons = await Sermon.find()
      .sort({ date: -1 })
      .limit(500)
      .lean();
    
    // Log view action
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const deviceInfo = parseDeviceInfo(userAgent);
    
    await logActionFromRequest(
      user,
      AuditActions.VIEW_SERMONS,
      'Sermon',
      {
        details: {
          resultCount: sermons.length,
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
    
    return NextResponse.json({ sermons });
  }

  if (req.method === 'POST') {
    const data = await req.json();

    // Validation
    if (!data.title || !data.preacher || !data.date || !data.summary || !data.bibleText) {
      return NextResponse.json(
        { error: 'Title, preacher, date, summary, and bible text are required' },
        { status: 400 }
      );
    }

    const sermon = new Sermon({
      title: data.title.trim(),
      preacher: data.preacher.trim(),
      date: new Date(data.date),
      summary: data.summary.trim(),
      bibleText: data.bibleText.trim(),
      mediaLink: data.mediaLink?.trim() || undefined,
    });

    await sermon.save();
    
    // Log create action
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const deviceInfo = parseDeviceInfo(userAgent);
    
    await logActionFromRequest(
      user,
      AuditActions.CREATE_SERMON,
      'Sermon',
      {
        entityId: (sermon._id as mongoose.Types.ObjectId).toString(),
        entityName: sermon.title,
        details: {
          title: sermon.title,
          preacher: sermon.preacher,
          date: sermon.date,
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
    
    return NextResponse.json({ sermon }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);

