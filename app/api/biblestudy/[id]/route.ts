import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import BibleStudyReport from '@/lib/models/BibleStudyReport';

async function handler(req: NextRequest, context: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const params = await context.params;
  const { id } = params;

  if (req.method === 'GET') {
    const report = await BibleStudyReport.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ report });
  }

  if (req.method === 'PUT') {
    const data = await req.json();

    // Validation
    if (
      !data.date ||
      !data.serviceType ||
      !data.topic ||
      !data.teacher ||
      !data.keyVerses ||
      !data.summary ||
      data.attendance === undefined
    ) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (data.attendance < 0) {
      return NextResponse.json(
        { error: 'Attendance must be a positive number' },
        { status: 400 }
      );
    }

    const report = await BibleStudyReport.findByIdAndUpdate(
      id,
      {
        date: new Date(data.date),
        serviceType: data.serviceType,
        topic: data.topic.trim(),
        teacher: data.teacher.trim(),
        keyVerses: data.keyVerses.trim(),
        summary: data.summary.trim(),
        attendance: parseInt(data.attendance),
        notes: data.notes?.trim() || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ report });
  }

  if (req.method === 'DELETE') {
    const report = await BibleStudyReport.findByIdAndDelete(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

