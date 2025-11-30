import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Family from '@/lib/models/Family';
import Member from '@/lib/models/Member';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { params, user }: { params: { id: string }; user: any }) {
  await connectDB();

  if (req.method === 'DELETE') {
    try {
      const familyId = params.id;

      if (!mongoose.Types.ObjectId.isValid(familyId)) {
        return NextResponse.json(
          { error: 'Invalid family ID' },
          { status: 400 }
        );
      }

      const family = await Family.findById(familyId).populate('members');

      if (!family) {
        return NextResponse.json(
          { error: 'Family not found' },
          { status: 404 }
        );
      }

      // Delete all members in the family
      if (family.members && Array.isArray(family.members)) {
        const memberIds = family.members.map((m: any) => 
          mongoose.Types.ObjectId.isValid(m._id || m) ? new mongoose.Types.ObjectId(m._id || m) : null
        ).filter(Boolean);

        if (memberIds.length > 0) {
          // Log deletion of each member
          for (const memberId of memberIds) {
            if (!memberId) continue;
            const member = await Member.findById(memberId);
            if (member) {
              await logActionFromRequest(
                user,
                AuditActions.DELETE_MEMBER,
                'Member',
                {
                  entityId: memberId.toString(),
                  entityName: member.fullName,
                  details: {
                    deletedAsPartOfFamily: true,
                    familyId: familyId,
                    familyName: family.familyName,
                  },
                  ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
                  userAgent: req.headers.get('user-agent') || undefined,
                }
              );
            }
          }

          await Member.deleteMany({ _id: { $in: memberIds } });
        }
      }

      // Log family deletion
      await logActionFromRequest(
        user,
        AuditActions.DELETE_FAMILY,
        'Family',
        {
          entityId: familyId,
          entityName: family.familyName,
          details: {
            membersDeleted: family.members?.length || 0,
          },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        }
      );

      // Delete the family
      await Family.findByIdAndDelete(familyId);

      return NextResponse.json(
        { message: 'Family and all members deleted successfully' },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error deleting family:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete family' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const DELETE = requireAuth(handler);

