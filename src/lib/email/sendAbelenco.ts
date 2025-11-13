import { resend } from './resend';
import { generateAbelencoEmailHtml, generateAbelencoEmailText, AbelencoEmailData } from './templates';

export interface SendAbelencoEmailOptions {
  details: { label: string; value: string }[];
}

export async function sendAbelencoEmail(options: SendAbelencoEmailOptions) {
  const { details } = options;

  // Check if API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing - cannot send email');
    throw new Error('Email service not configured');
  }

  const emailData: AbelencoEmailData = {
    details,
  };

  try {
    console.log(`[EMAIL] Attempting to send Abel&Co email to: info@abelenco.nl`);

    const { data, error } = await resend.emails.send({
      from: 'ZON-ECN <onderhoud@zon-ecn.nl>',
      to: ['info@abelenco.nl'],
      subject: 'Nieuw onderhoudscontract ZON-ECN',
      html: generateAbelencoEmailHtml(emailData),
      text: generateAbelencoEmailText(emailData),
      replyTo: 'onderhoud@zon-ecn.nl',
    });

    if (error) {
      console.error('[EMAIL] Resend API error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('[EMAIL] Abel&Co email sent successfully!');
    console.log('[EMAIL] Email ID:', data?.id);
    console.log('[EMAIL] Sent to: info@abelenco.nl');
    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL] Exception sending Abel&Co email:', error);
    if (error instanceof Error) {
      console.error('[EMAIL] Error message:', error.message);
      console.error('[EMAIL] Error stack:', error.stack);
    }
    throw error;
  }
}

