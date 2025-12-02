import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import mongoose from 'mongoose';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user, params }: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (req.method === 'GET') {
    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ member });
  }

  if (req.method === 'PUT') {
    const data = await req.json();
    const oldMember = await Member.findById(id);
    if (!oldMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    const member = await Member.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    
    // Log the update action
    await logActionFromRequest(
      user,
      AuditActions.UPDATE_MEMBER,
      'Member',
      {
        entityId: id,
        entityName: member?.fullName || oldMember.fullName,
        details: {
          changes: Object.keys(data),
          previousValues: oldMember.toObject(),
          newValues: data,
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );
    
    return NextResponse.json({ member });
  }

  if (req.method === 'DELETE') {
    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    // Log the delete action before deletion
    await logActionFromRequest(
      user,
      AuditActions.DELETE_MEMBER,
      'Member',
      {
        entityId: id,
        entityName: member.fullName,
        details: {
          deletedMemberData: {
            fullName: member.fullName,
            email: member.email,
            phone: member.phone,
            membershipStatus: member.membershipStatus,
          },
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );
    
    await Member.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

