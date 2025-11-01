import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import { addDays, format } from 'date-fns';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'month';

    const today = new Date();
    const nextWeek = addDays(today, 7);
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const members = await Member.find({});
    const upcomingBirthdays = members
      .filter((member) => {
        const dob = new Date(member.dateOfBirth);
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        
        if (filter === 'week') {
          return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
        } else {
          return thisYearBirthday >= currentMonth && thisYearBirthday <= monthEnd;
        }
      })
      .map((member) => ({
        id: member._id,
        name: member.fullName,
        email: member.email,
        date: format(new Date(member.dateOfBirth), 'MMM dd'),
        profileImage: member.profileImage,
      }));

    return NextResponse.json({ birthdays: upcomingBirthdays });
  } catch (error: any) {
    console.error('Birthdays error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch birthdays' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);


