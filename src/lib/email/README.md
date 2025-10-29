# Email System Documentation

This directory contains the email functionality for the ZON-ECN Forms application using Resend.

## Setup

### 1. Environment Variable

Add your Resend API key to `.env`:

```env
RESEND_API_KEY=your_api_key_here
```

### 2. Domain Verification (For Production)

To send emails from `onderhoud@zon-ecn.nl`, you need to verify your domain in Resend:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter `zon-ecn.nl`
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

**DNS Records to Add:**
- SPF Record (TXT)
- DKIM Record (TXT)
- MX Record (if you want to receive bounce notifications)

### 3. Testing Before Domain Verification

Before domain verification, Resend allows you to send test emails from `onboarding@resend.dev`. The code will automatically fall back to this if your domain isn't verified yet.

## Files

- **`resend.ts`** - Initializes the Resend client
- **`templates.ts`** - Email templates (HTML and plain text)
- **`sendConfirmation.ts`** - Function to send confirmation emails
- **`index.ts`** - Exports all email functions

## Usage

The email functionality is automatically triggered when a form is submitted. See the flow files:
- `src/ai/flows/verwerk-cv-contract-flow.ts`
- `src/ai/flows/verwerk-warmtepomp-contract-flow.ts`
- `src/ai/flows/verwerk-airco-contract-flow.ts`

## Email Content

**Subject:** "We hebben uw ZON-ECN onderhoudscontract aanvraag ontvangen!"

**Body:** The email contains a thank you message in Dutch confirming receipt of the maintenance contract request.

## Updating Email Content

To update the email text, edit the template functions in [`templates.ts`](templates.ts):
- `generateConfirmationEmailHtml()` - HTML version
- `generateConfirmationEmailText()` - Plain text version

## Error Handling

If the email fails to send, it will not cause the form submission to fail. The contract will still be saved to the database, and an error will be logged to the console.

## Resend Dashboard

Monitor email delivery, view logs, and manage settings at [resend.com/dashboard](https://resend.com/dashboard)
