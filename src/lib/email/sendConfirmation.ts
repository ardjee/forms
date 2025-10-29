import { resend } from './resend';
import { generateConfirmationEmailHtml, generateConfirmationEmailText, ConfirmationEmailData } from './templates';

export interface SendConfirmationEmailOptions {
  to: string;
  name: string;
}

export async function sendConfirmationEmail(options: SendConfirmationEmailOptions) {
  const { to, name } = options;

  const emailData: ConfirmationEmailData = {
    name,
    email: to,
  };

  try {
    console.log(`Attempting to send confirmation email to: ${to}`);

    const { data, error } = await resend.emails.send({
      from: 'ZON-ECN <onboarding@resend.dev>',
      to: [to],
      subject: 'We hebben uw ZON-ECN onderhoudscontract aanvraag ontvangen!',
      html: generateConfirmationEmailHtml(emailData),
      text: generateConfirmationEmailText(emailData),
      replyTo: 'onderhoud@zon-ecn.nl',
    });

    if (error) {
      console.error('Resend API error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Confirmation email sent successfully!');
    console.log('Email ID:', data?.id);
    console.log('Sent to:', to);
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending confirmation email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}
