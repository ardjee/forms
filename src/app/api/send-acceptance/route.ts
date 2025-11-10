import { NextResponse } from 'next/server';
import { sendAcceptanceEmail } from '@/lib/email/sendAcceptance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, name, contractType, abonnement, frequentie, maandPrijs, details } = body || {};

    if (!to || !name || !contractType || !frequentie || typeof maandPrijs !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sendAcceptanceEmail({
      to,
      name,
      contractType,
      abonnement,
      frequentie,
      maandPrijs,
      details,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('[API] send-acceptance error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

