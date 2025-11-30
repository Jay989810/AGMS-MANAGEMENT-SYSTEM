import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import AuditLog from '@/lib/models/AuditLog';

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

