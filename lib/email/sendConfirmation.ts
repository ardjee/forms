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
    const { data, error } = await resend.emails.send({
      from: 'ZON-ECN <onderhoud@zon-ecn.nl>',
      to: [to],
      subject: 'We hebben uw ZON-ECN onderhoudscontract aanvraag ontvangen!',
      html: generateConfirmationEmailHtml(emailData),
      text: generateConfirmationEmailText(emailData),
      replyTo: 'onderhoud@zon-ecn.nl',
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }

    console.log('Confirmation email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}
