import { NextResponse } from 'next/server';
import { sendAbelencoEmail } from '@/lib/email/sendAbelenco';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { details } = body || {};

    if (!details || !Array.isArray(details) || details.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid details array' }, { status: 400 });
    }

    const result = await sendAbelencoEmail({
      details,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('[API] send-abelenco error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

