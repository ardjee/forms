export interface ConfirmationEmailData {
  name: string;
  email: string;
}

export interface AcceptanceEmailData {
  name: string;
  email: string;
  contractType: string;
  abonnement: string;
  frequentie: string;
  maandPrijs: string;
}

export function generateConfirmationEmailHtml(data: ConfirmationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestiging Aanvraag</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #0066cc; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">ZON-ECN</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Beste ${data.name},</h2>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>Bedankt voor uw aanvraag!</strong>
              </p>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                U hoort zo spoedig mogelijk van ons of uw aanvraag akkoord is en in kan gaan per 01-01-2026.
                Mochten we naar aanleiding van de verstrekte gegevens toch nog vragen hebben, dan nemen we
                contact op per e-mail of telefoon.
              </p>

              <p style="margin: 0 0 10px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Met vriendelijke groet,<br>
                <strong>Hugo</strong><br>
                ZON-ECN
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Dit is een geautomatiseerd bericht. Reageer niet op deze e-mail.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateConfirmationEmailText(data: ConfirmationEmailData): string {
  return `
Beste ${data.name},

Bedankt voor uw aanvraag!

U hoort zo spoedig mogelijk van ons of uw aanvraag akkoord is en in kan gaan per 01-01-2026. Mochten we naar aanleiding van de verstrekte gegevens toch nog vragen hebben, dan nemen we contact op per e-mail of telefoon.

Met vriendelijke groet,
Hugo
ZON-ECN

---
Dit is een geautomatiseerd bericht. Reageer niet op deze e-mail.
  `.trim();
}

export function generateAcceptanceEmailHtml(data: AcceptanceEmailData): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aanvraag Goedgekeurd</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #10b981; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">ZON-ECN</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Beste ${data.name},</h2>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                We hebben uw aanvraag voor <strong>${data.contractType}</strong> bekeken en u bent opgenomen in ons bestand.
              </p>

              <div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px;">
                  <strong>Uw abonnementsgegevens:</strong>
                </p>
                <p style="margin: 5px 0; color: #666666; font-size: 15px;">
                  • Abonnement: ${data.abonnement}<br>
                  • Frequentie: ${data.frequentie}<br>
                  • Maandbedrag: ${data.maandPrijs}
                </p>
              </div>

              <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                We danken u voor het vertrouwen in ZON-ECN en hopen op een lange en goede samenwerking.
              </p>

              <p style="margin: 0 0 10px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Met vriendelijke groet,<br>
                <strong>Hugo</strong><br>
                ZON-ECN
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Dit is een geautomatiseerd bericht. Reageer niet op deze e-mail.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateAcceptanceEmailText(data: AcceptanceEmailData): string {
  return `
Beste ${data.name},

We hebben uw aanvraag voor ${data.contractType} bekeken en u bent opgenomen in ons bestand.

Uw abonnementsgegevens:
• Abonnement: ${data.abonnement}
• Frequentie: ${data.frequentie}
• Maandbedrag: ${data.maandPrijs}

We danken u voor het vertrouwen in ZON-ECN en hopen op een lange en goede samenwerking.

Met vriendelijke groet,
Hugo
ZON-ECN

---
Dit is een geautomatiseerd bericht. Reageer niet op deze e-mail.
  `.trim();
}
