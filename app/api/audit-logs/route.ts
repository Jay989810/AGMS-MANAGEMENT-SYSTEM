import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import AuditLog from '@/lib/models/AuditLog';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import { parseDeviceInfo, formatDeviceInfo } from '@/lib/device-info';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const action = searchParams.get('action') || '';
      const entityType = searchParams.get('entityType') || '';
      const userId = searchParams.get('userId') || '';
      const startDate = searchParams.get('startDate') || '';
      const endDate = searchParams.get('endDate') || '';
      const search = searchParams.get('search') || '';

      const query: any = {};

      // Filter by action
      if (action) {
        query.action = action;
      }

      // Filter by entity type
      if (entityType) {
        query.entityType = entityType;
      }

      // Filter by user
      if (userId) {
        query.userId = userId;
      }

      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
          query.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          query.timestamp.$lte = new Date(endDate);
        }
      }

      // Search filter (searches in userName, userEmail, entityName, action)
      if (search) {
        query.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { entityName: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await AuditLog.countDocuments(query);

      // Get logs with pagination
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Log view action (but don't log viewing audit logs to avoid infinite recursion)
      // Only log if it's not already a view audit logs action
      const userAgent = req.headers.get('user-agent') || undefined;
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
      const deviceInfo = parseDeviceInfo(userAgent);
      
      // Use a simple logAction to avoid recursion
      try {
        await logActionFromRequest(
          user,
          AuditActions.VIEW_AUDIT_LOGS,
          'AuditLog',
          {
            details: {
              filters: { action, entityType, userId, startDate, endDate, search },
              resultCount: logs.length,
              page,
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
      } catch (error) {
        // Silently fail to avoid breaking audit log viewing
        console.error('Failed to log audit log view:', error);
      }

      return NextResponse.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);

