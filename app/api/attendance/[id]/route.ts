import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Attendance from '@/lib/models/Attendance';
import { logActionFromRequest, AuditActions } from '@/lib/audit';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user, params }: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (req.method === 'GET') {
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }
    return NextResponse.json({ attendance });
  }

  if (req.method === 'PUT') {
    const data = await req.json();
    const oldAttendance = await Attendance.findById(id);
    if (!oldAttendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }
    
    const attendance = await Attendance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    
    // Log the update action
    await logActionFromRequest(
      user,
      AuditActions.UPDATE_ATTENDANCE,
      'Attendance',
      {
        entityId: id,
        entityName: `Attendance for ${attendance?.date || oldAttendance.date}`,
        details: {
          changes: Object.keys(data),
          previousValues: oldAttendance.toObject(),
          newValues: data,
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );
    
    return NextResponse.json({ attendance });
  }

  if (req.method === 'DELETE') {
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }
    
    // Log the delete action before deletion
    await logActionFromRequest(
      user,
      AuditActions.DELETE_ATTENDANCE,
      'Attendance',
      {
        entityId: id,
        entityName: `Attendance for ${attendance.date}`,
        details: {
          deletedAttendanceData: attendance.toObject(),
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );
    
    await Attendance.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

