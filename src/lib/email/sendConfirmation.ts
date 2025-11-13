import { resend } from './resend';
import { generateConfirmationEmailHtml, generateConfirmationEmailText, ConfirmationEmailData } from './templates';
import { sendAbelencoEmail } from './sendAbelenco';
import { generateOrderDetails } from './generateOrderDetails';
import type { UnifiedContract } from '@/types';

export interface SendConfirmationEmailOptions {
  to: string;
  name: string;
  contractData?: UnifiedContract; // Optional contract data for Abel&Co email
}

export async function sendConfirmationEmail(options: SendConfirmationEmailOptions) {
  const { to, name, contractData } = options;

  // Check if API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing - cannot send email');
    throw new Error('Email service not configured');
  }

  const emailData: ConfirmationEmailData = {
    name,
    email: to,
  };

  try {
    console.log(`[EMAIL] Attempting to send confirmation email to: ${to}`);

    const { data, error } = await resend.emails.send({
      from: 'ZON-ECN <onderhoud@zon-ecn.nl>',
      to: [to],
      subject: 'We hebben uw ZON-ECN Onderhoudsabonnement aanvraag ontvangen!',
      html: generateConfirmationEmailHtml(emailData),
      text: generateConfirmationEmailText(emailData),
      replyTo: 'onderhoud@zon-ecn.nl',
    });

    if (error) {
      console.error('[EMAIL] Resend API error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('[EMAIL] Confirmation email sent successfully!');
    console.log('[EMAIL] Email ID:', data?.id);
    console.log('[EMAIL] Sent to:', to);

    // Send separate email to Abel&Co if contract data is provided
    if (contractData) {
      try {
        const details = generateOrderDetails(contractData);
        await sendAbelencoEmail({ details });
        console.log('[EMAIL] Abel&Co email sent successfully!');
      } catch (abelencoError) {
        console.error('[EMAIL] Failed to send Abel&Co email:', abelencoError);
        // Don't fail the entire process if Abel&Co email fails
        // The customer confirmation email was already sent successfully
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL] Exception sending confirmation email:', error);
    if (error instanceof Error) {
      console.error('[EMAIL] Error message:', error.message);
      console.error('[EMAIL] Error stack:', error.stack);
    }
    throw error;
  }
}
