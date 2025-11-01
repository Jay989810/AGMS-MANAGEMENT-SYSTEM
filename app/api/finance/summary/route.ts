import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Financial from '@/lib/models/Financial';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query for date range if provided
    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Calculate totals
    const incomeRecords = await Financial.find({ ...query, type: 'Income' });
    const expenseRecords = await Financial.find({ ...query, type: 'Expense' });

    const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
    const totalExpense = expenseRecords.reduce((sum, record) => sum + record.amount, 0);
    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance,
      incomeCount: incomeRecords.length,
      expenseCount: expenseRecords.length,
    });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);

