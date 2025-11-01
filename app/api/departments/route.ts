import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Department from '@/lib/models/Department';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    // Optimize: Use lean() for faster queries
    const departments = await Department.find()
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ departments });
  }

  if (req.method === 'POST') {
    const data = await req.json();
    const department = new Department(data);
    await department.save();
    return NextResponse.json({ department }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);


