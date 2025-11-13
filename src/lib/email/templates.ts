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
  details?: { label: string; value: string }[];
}

export interface AbelencoEmailData {
  details: { label: string; value: string }[];
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
      <td align="center" style="padding: 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Beste ${data.name},</h2>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>Bedankt voor uw aanvraag!</strong>
              </p>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Bedankt voor uw interesse in een Onderhoudsabonnement bij ZON-ECN Installatietechniek. We hebben uw aanvraag in goede orde ontvangen. We streven ernaar om deze binnen 7 werkdagen te kunnen bevestigen.
              </p>

              <p style="margin: 0 0 10px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Met vriendelijke groet,<br><br>
                <strong>ZON-ECN Installatietechniek</strong><br>
                Hugo Schneider
              </p>
            </td>
          </tr>

          <!-- Footer (intentionally left minimal) -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;"></td>
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

Bedankt voor uw interesse in een onderhoudscontract bij ZON-ECN Installatietechniek. We hebben uw aanvraag in goede orde ontvangen. We streven ernaar om deze binnen 7 werkdagen te kunnen bevestigen.

Met vriendelijke groet,

ZON-ECN Installatietechniek
Hugo Schneider

 
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
      <td align="center" style="padding: 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Beste ${data.name},</h2>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>Welkom!</strong>
              </p>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                We zijn verheugd u te kunnen mededelen dat uw Onderhoudsabonnement met ingang van 1 januari 2026 actief is. We hebben uw abonnement opgenomen in ons systeem met onderstaande gegevens. Deze email kunt u beschouwen als een bevestiging van uw nieuwe Onderhoudsabonnement.
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

              ${Array.isArray(data.details) && data.details.length > 0 ? `
              <div style="margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px;">
                  <strong>Uw keuzes uit het formulier:</strong>
                </p>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background: #ffffff;">
                  <tbody>
                    ${data.details
                      .map(item => `
                        <tr>
                          <td style=\"padding: 10px 12px; border: 1px solid #e5e7eb; width: 45%; background: #f9fafb; color: #374151; font-size: 14px;\">${item.label}</td>
                          <td style=\"padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;\">${item.value}</td>
                        </tr>
                      `)
                      .join('')}
                  </tbody>
                </table>
              </div>
              ` : ''}

              <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                We danken u voor het vertrouwen in ZON-ECN en hopen op een lange en goede samenwerking.
              </p>

              <p style="margin: 0 0 10px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Met vriendelijke groet,<br><br>
                <strong>ZON-ECN Installatietechniek</strong><br>
                Hugo Schneider
              </p>
            </td>
          </tr>

          <!-- Footer (intentionally left minimal) -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;"></td>
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

Welkom!

We zijn verheugd u te kunnen mededelen dat uw onderhoudscontract met ingang van 1 januari 2026 actief is. We hebben uw contract opgenomen in ons systeem met onderstaande gegevens. Deze email kunt u beschouwen als een bevestiging van uw nieuwe onderhoudscontract.

Uw abonnementsgegevens:
• Abonnement: ${data.abonnement}
• Frequentie: ${data.frequentie}
• Maandbedrag: ${data.maandPrijs}

We danken u voor het vertrouwen in ZON-ECN en hopen op een lange en goede samenwerking.

Met vriendelijke groet,

ZON-ECN Installatietechniek
Hugo Schneider

${Array.isArray(data.details) && data.details.length > 0 ? `
Uw keuzes uit het formulier:
${data.details.map(d => `- ${d.label}: ${d.value}`).join('\\n')}
` : ''}
  `.trim();
}

export function generateAbelencoEmailHtml(data: AbelencoEmailData): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuw onderhoudscontract</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Beste Abel&Co,</h2>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Hierbij het vriendelijke verzoek een nieuw serviceabonnement te administreren en de maandelijkse incasso op te starten.
              </p>

              ${Array.isArray(data.details) && data.details.length > 0 ? `
              <div style="margin: 20px 0;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background: #ffffff;">
                  <tbody>
                    ${data.details
                      .map(item => `
                        <tr>
                          <td style=\"padding: 10px 12px; border: 1px solid #e5e7eb; width: 45%; background: #f9fafb; color: #374151; font-size: 14px;\">${item.label}</td>
                          <td style=\"padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;\">${item.value}</td>
                        </tr>
                      `)
                      .join('')}
                  </tbody>
                </table>
              </div>
              ` : ''}

              <p style="margin: 20px 0 10px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Met vriendelijke groet,<br><br>
                <strong>Team Service & Onderhoud</strong><br>
                Hugo Schneider
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateAbelencoEmailText(data: AbelencoEmailData): string {
  return `
Beste Abel&Co,

Hierbij het vriendelijke verzoek een nieuw serviceabonnement te administreren en de maandelijkse incasso op te starten.

${Array.isArray(data.details) && data.details.length > 0 ? `
${data.details.map(d => `${d.label}: ${d.value}`).join('\\n')}
` : ''}

Met vriendelijke groet,

Team Service & Onderhoud
Hugo Schneider
  `.trim();
}
