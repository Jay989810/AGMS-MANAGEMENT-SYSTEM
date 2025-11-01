import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Department from '@/lib/models/Department';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const params = await context.params;
  const { id } = params;

  if (req.method === 'GET') {
    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    return NextResponse.json({ department });
  }

  if (req.method === 'PUT') {
    const data = await req.json();
    const department = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    return NextResponse.json({ department });
  }

  if (req.method === 'DELETE') {
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

