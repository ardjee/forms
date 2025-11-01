import { Resend } from 'resend';

// Initialize Resend with API key
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && typeof window === 'undefined') {
  // Only log on server-side
  console.warn('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(apiKey || 'dummy-key');
