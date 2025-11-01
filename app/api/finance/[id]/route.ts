import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Financial from '@/lib/models/Financial';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const params = await context.params;
  const { id } = params;

  if (req.method === 'GET') {
    const record = await Financial.findById(id);
    if (!record) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  if (req.method === 'PUT') {
    const data = await req.json();

    // Validation
    if (!data.date || !data.category || !data.description || data.amount === undefined || !data.type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (data.amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const record = await Financial.findByIdAndUpdate(
      id,
      {
        date: new Date(data.date),
        category: data.category,
        description: data.description.trim(),
        amount: parseFloat(data.amount),
        type: data.type,
      },
      { new: true, runValidators: true }
    );

    if (!record) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  if (req.method === 'DELETE') {
    const record = await Financial.findByIdAndDelete(id);
    if (!record) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

