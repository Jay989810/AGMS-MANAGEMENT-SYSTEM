import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import Family from '@/lib/models/Family';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import mongoose from 'mongoose';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { familyName, address, phone, email, headOfFamily, members } = body;

      // Validate required fields
      if (!familyName || !address || !phone || !headOfFamily) {
        return NextResponse.json(
          { error: 'Missing required fields: familyName, address, phone, and headOfFamily are required' },
          { status: 400 }
        );
      }

      if (!headOfFamily.fullName || !headOfFamily.dateOfBirth) {
        return NextResponse.json(
          { error: 'Head of family must have fullName and dateOfBirth' },
          { status: 400 }
        );
      }

      // Create head of family
      const headMember = new Member({
        ...headOfFamily,
        familyId: null, // Will be updated after family creation
        relationship: headOfFamily.relationship || 'Head',
      });
      
      // Validate head member before saving
      try {
        await headMember.validate();
      } catch (validationError: any) {
        console.error('Head member validation error:', validationError);
        return NextResponse.json(
          { error: `Validation error: ${validationError.message}` },
          { status: 400 }
        );
      }

      await headMember.save();

      // Create family
      const family = new Family({
        familyName,
        headOfFamily: headMember._id,
        address,
        phone: phone || headOfFamily.phone || '',
        email: email || headOfFamily.email || undefined,
        members: [headMember._id],
      });

      // Validate family before saving
      try {
        await family.validate();
      } catch (validationError: any) {
        // If family validation fails, delete the head member
        await Member.findByIdAndDelete(headMember._id);
        console.error('Family validation error:', validationError);
        return NextResponse.json(
          { error: `Family validation error: ${validationError.message}` },
          { status: 400 }
        );
      }

      await family.save();

      // Update head of family with familyId
      headMember.familyId = family._id as mongoose.Types.ObjectId;
      await headMember.save();

      // Create and link other family members
      const memberIds: mongoose.Types.ObjectId[] = [headMember._id as mongoose.Types.ObjectId];
      if (members && Array.isArray(members) && members.length > 0) {
        for (const memberData of members) {
          try {
            const member = new Member({
              ...memberData,
              familyId: family._id as mongoose.Types.ObjectId,
              address: address, // Use family address
            });
            await member.validate();
            await member.save();
            memberIds.push(member._id as mongoose.Types.ObjectId);
          } catch (memberError: any) {
            console.error('Error creating family member:', memberError);
            // Continue with other members even if one fails
          }
        }
      }

      // Update family with all member IDs
      family.members = memberIds;
      await family.save();

      // Log the action
      await logActionFromRequest(
        user,
        AuditActions.CREATE_FAMILY,
        'Family',
        {
          entityId: (family._id as mongoose.Types.ObjectId).toString(),
          entityName: family.familyName,
          details: {
            memberCount: memberIds.length,
            headOfFamily: headMember.fullName,
          },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        }
      );

      // Log creation of each member
      for (const memberId of memberIds) {
        const member = await Member.findById(memberId);
        if (member) {
          await logActionFromRequest(
            user,
            AuditActions.CREATE_MEMBER,
            'Member',
            {
              entityId: memberId.toString(),
              entityName: member.fullName,
              details: {
                familyId: (family._id as mongoose.Types.ObjectId).toString(),
                familyName: family.familyName,
              },
              ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
              userAgent: req.headers.get('user-agent') || undefined,
            }
          );
        }
      }

      // Populate family data for response
      const populatedFamily = await Family.findById(family._id)
        .populate('headOfFamily')
        .populate('members')
        .lean();

      return NextResponse.json({ 
        family: populatedFamily,
        message: 'Family created successfully'
      }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating family:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create family' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = requireAuth(handler);

