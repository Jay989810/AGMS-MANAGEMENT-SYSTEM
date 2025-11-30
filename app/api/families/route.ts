import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Family from '@/lib/models/Family';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';

      const query: any = {};
      if (search) {
        query.familyName = { $regex: search, $options: 'i' };
      }

      const families = await Family.find(query)
        .populate('headOfFamily', 'fullName phone email')
        .populate('members', 'fullName phone email membershipStatus')
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ families });
    } catch (error: any) {
      console.error('Error fetching families:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch families' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);

