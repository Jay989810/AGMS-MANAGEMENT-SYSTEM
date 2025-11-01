import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Sermon from '@/lib/models/Sermon';

async function handler(req: NextRequest, context: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const params = await context.params;
  const { id } = params;

  if (req.method === 'GET') {
    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }
    return NextResponse.json({ sermon });
  }

  if (req.method === 'PUT') {
    const data = await req.json();

    // Validation
    if (!data.title || !data.preacher || !data.date || !data.summary || !data.bibleText) {
      return NextResponse.json(
        { error: 'Title, preacher, date, summary, and bible text are required' },
        { status: 400 }
      );
    }

    const sermon = await Sermon.findByIdAndUpdate(
      id,
      {
        title: data.title.trim(),
        preacher: data.preacher.trim(),
        date: new Date(data.date),
        summary: data.summary.trim(),
        bibleText: data.bibleText.trim(),
        mediaLink: data.mediaLink?.trim() || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!sermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }
    return NextResponse.json({ sermon });
  }

  if (req.method === 'DELETE') {
    const sermon = await Sermon.findByIdAndDelete(id);
    if (!sermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

