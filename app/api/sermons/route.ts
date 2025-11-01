import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Sermon from '@/lib/models/Sermon';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    // Optimize: Limit results and use lean() for faster queries
    const sermons = await Sermon.find()
      .sort({ date: -1 })
      .limit(500)
      .lean();
    return NextResponse.json({ sermons });
  }

  if (req.method === 'POST') {
    const data = await req.json();

    // Validation
    if (!data.title || !data.preacher || !data.date || !data.summary || !data.bibleText) {
      return NextResponse.json(
        { error: 'Title, preacher, date, summary, and bible text are required' },
        { status: 400 }
      );
    }

    const sermon = new Sermon({
      title: data.title.trim(),
      preacher: data.preacher.trim(),
      date: new Date(data.date),
      summary: data.summary.trim(),
      bibleText: data.bibleText.trim(),
      mediaLink: data.mediaLink?.trim() || undefined,
    });

    await sermon.save();
    return NextResponse.json({ sermon }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);

