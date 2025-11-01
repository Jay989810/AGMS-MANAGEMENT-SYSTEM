import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import BibleStudyReport from '@/lib/models/BibleStudyReport';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    // Get all reports sorted by date (newest first)
    const reports = await BibleStudyReport.find().sort({ date: -1 });
    return NextResponse.json({ reports });
  }

  if (req.method === 'POST') {
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

    const report = new BibleStudyReport({
      date: new Date(data.date),
      serviceType: data.serviceType,
      topic: data.topic.trim(),
      teacher: data.teacher.trim(),
      keyVerses: data.keyVerses.trim(),
      summary: data.summary.trim(),
      attendance: parseInt(data.attendance),
      notes: data.notes?.trim() || undefined,
    });

    await report.save();
    return NextResponse.json({ report }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);

