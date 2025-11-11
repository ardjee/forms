import { resend } from './resend';
import { generateAcceptanceEmailHtml, generateAcceptanceEmailText, AcceptanceEmailData } from './templates';

export interface SendAcceptanceEmailOptions {
  to: string;
  name: string;
  contractType: string;
  abonnement?: string;
  frequentie: string;
  maandPrijs: number;
  details?: { label: string; value: string }[];
}

export async function sendAcceptanceEmail(options: SendAcceptanceEmailOptions) {
  const { to, name, contractType, abonnement, frequentie, maandPrijs, details } = options;

  // Check if API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing - cannot send email');
    throw new Error('Email service not configured');
  }

  const emailData: AcceptanceEmailData = {
    name,
    email: to,
    contractType,
    abonnement: abonnement || 'Standaard',
    frequentie,
    maandPrijs: `€${maandPrijs.toFixed(2)} per maand`,
    details,
  };

  try {
    console.log(`[EMAIL] Attempting to send acceptance email to: ${to}`);

    const { data, error } = await resend.emails.send({
      from: 'ZON-ECN <onderhoud@zon-ecn.nl>',
      to: [to],
      bcc: ['info@abelenco.nl'],
      subject: 'Uw aanvraag bij ZON-ECN is goedgekeurd!',
      html: generateAcceptanceEmailHtml(emailData),
      text: generateAcceptanceEmailText(emailData),
      replyTo: 'onderhoud@zon-ecn.nl',
    });

    if (error) {
      console.error('[EMAIL] Resend API error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('[EMAIL] Acceptance email sent successfully!');
    console.log('[EMAIL] Email ID:', data?.id);
    console.log('[EMAIL] Sent to:', to);
    console.log('[EMAIL] BCC to: info@abelenco.nl');
    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL] Exception sending acceptance email:', error);
    if (error instanceof Error) {
      console.error('[EMAIL] Error message:', error.message);
      console.error('[EMAIL] Error stack:', error.stack);
    }
    throw error;
  }
}
