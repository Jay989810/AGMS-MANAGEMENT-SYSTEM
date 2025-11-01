import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth-token');
  return response;
}


