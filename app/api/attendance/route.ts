import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Attendance from '@/lib/models/Attendance';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    const attendances = await Attendance.find().sort({ date: -1 }).limit(100);
    return NextResponse.json({ attendances });
  }

  if (req.method === 'POST') {
    const data = await req.json();
    const attendance = new Attendance(data);
    await attendance.save();
    return NextResponse.json({ attendance }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);


