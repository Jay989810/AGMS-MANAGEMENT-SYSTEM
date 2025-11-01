import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Member from '@/lib/models/Member';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const params = await context.params;
  const { id } = params;

  if (req.method === 'GET') {
    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ member });
  }

  if (req.method === 'PUT') {
    const data = await req.json();
    const member = await Member.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ member });
  }

  if (req.method === 'DELETE') {
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

