import { Resend } from 'resend';

// Initialize Resend with API key
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error('RESEND_API_KEY is not defined in environment variables');
  // Create a dummy instance to prevent import errors
  // The sendConfirmationEmail function will handle the missing key gracefully
}

export const resend = new Resend(apiKey || 'dummy-key');
