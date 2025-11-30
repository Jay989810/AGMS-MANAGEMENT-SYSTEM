import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import Family from '@/lib/models/Family';
import mongoose from 'mongoose';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const { familyName, address, phone, email, headOfFamily, members } = await req.json();

      // Create head of family
      const headMember = new Member({
        ...headOfFamily,
        familyId: null, // Will be updated after family creation
      });
      await headMember.save();

      // Create family
      const family = new Family({
        familyName,
        headOfFamily: headMember._id,
        address,
        phone,
        email,
        members: [headMember._id],
      });
      await family.save();

      // Update head of family with familyId
      headMember.familyId = family._id as mongoose.Types.ObjectId;
      await headMember.save();

      // Create and link other family members
      const memberIds: mongoose.Types.ObjectId[] = [headMember._id as mongoose.Types.ObjectId];
      if (members && members.length > 0) {
        for (const memberData of members) {
          const member = new Member({
            ...memberData,
            familyId: family._id as mongoose.Types.ObjectId,
            address: address, // Use family address
          });
          await member.save();
          memberIds.push(member._id as mongoose.Types.ObjectId);
        }
      }

      // Update family with all member IDs
      family.members = memberIds;
      await family.save();

      // Populate family data for response
      const populatedFamily = await Family.findById(family._id)
        .populate('headOfFamily')
        .populate('members')
        .lean();

      return NextResponse.json({ family: populatedFamily }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating family:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create family' },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = requireAuth(handler);

