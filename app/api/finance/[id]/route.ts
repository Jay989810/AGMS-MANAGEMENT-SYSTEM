import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Financial from '@/lib/models/Financial';
import { logActionFromRequest, AuditActions } from '@/lib/audit';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user, params }: { user: any; params: Promise<{ id: string }> }) {
  await connectDB();
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (req.method === 'GET') {
    const record = await Financial.findById(id);
    if (!record) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  if (req.method === 'PUT') {
    const data = await req.json();
    const oldRecord = await Financial.findById(id);
    
    if (!oldRecord) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }

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

    // Log the update action
    await logActionFromRequest(
      user,
      AuditActions.UPDATE_FINANCE,
      'Finance',
      {
        entityId: id,
        entityName: `${data.type} - ${data.category} (${data.amount})`,
        details: {
          changes: Object.keys(data),
          previousValues: oldRecord.toObject(),
          newValues: data,
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );

    return NextResponse.json({ record });
  }

  if (req.method === 'DELETE') {
    const record = await Financial.findById(id);
    if (!record) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }
    
    // Log the delete action before deletion
    await logActionFromRequest(
      user,
      AuditActions.DELETE_FINANCE,
      'Finance',
      {
        entityId: id,
        entityName: `${record.type} - ${record.category} (${record.amount})`,
        details: {
          deletedRecordData: record.toObject(),
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );
    
    await Financial.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);

