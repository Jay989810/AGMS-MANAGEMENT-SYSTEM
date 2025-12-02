import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import { parseDeviceInfo, formatDeviceInfo } from '@/lib/device-info';

// Mark route as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

async function handler(request: NextRequest, { user }: { user: any }) {
  // Log logout action with device information
  const userAgent = request.headers.get('user-agent') || undefined;
  const ipAddress = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    undefined;
  
  const deviceInfo = parseDeviceInfo(userAgent);
  
  await logActionFromRequest(
    user,
    AuditActions.LOGOUT,
    'User',
    {
      entityId: user._id || user.id,
      entityName: user.name || user.email || 'Unknown',
      details: {
        logoutTime: new Date().toISOString(),
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

  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth-token');
  return response;
}

export const POST = requireAuth(handler);


