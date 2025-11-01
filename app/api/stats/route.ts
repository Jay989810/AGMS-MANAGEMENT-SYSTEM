import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';
import Attendance from '@/lib/models/Attendance';
import Department from '@/lib/models/Department';
import { startOfMonth, endOfMonth, addDays, format } from 'date-fns';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  try {
    const totalMembers = await Member.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalAttendance = await Attendance.countDocuments();

    // Get upcoming birthdays (next 7 days)
    const today = new Date();
    const nextWeek = addDays(today, 7);
    const currentMonth = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Optimize: Only fetch needed fields and use database filtering
    const members = await Member.find({})
      .select('dateOfBirth fullName _id')
      .lean();
    
    const upcomingBirthdays = members
      .filter((member) => {
        const dob = new Date(member.dateOfBirth);
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
      })
      .map((member) => ({
        id: member._id,
        name: member.fullName,
        date: format(new Date(member.dateOfBirth), 'MMM dd'),
      }))
      .slice(0, 5);

    // Recent attendance - Optimize with lean()
    const recentAttendance = await Attendance.find()
      .sort({ date: -1 })
      .limit(5)
      .select('eventName date totalPresent')
      .lean();

    return NextResponse.json({
      totalMembers,
      totalDepartments,
      totalAttendance,
      upcomingBirthdays,
      recentAttendance,
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);


