import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Financial from '@/lib/models/Financial';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    // Build query
    const query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Include the entire end date
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const records = await Financial.find(query).sort({ date: -1 });
    return NextResponse.json({ records });
  }

  if (req.method === 'POST') {
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

    const record = new Financial({
      date: new Date(data.date),
      category: data.category,
      description: data.description.trim(),
      amount: parseFloat(data.amount),
      type: data.type,
    });

    await record.save();
    return NextResponse.json({ record }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);

