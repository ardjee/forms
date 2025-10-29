'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import HeaderLanding from '@/components/layout/header-landing';
import { AppProviders } from '@/components/AppProviders';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <title>ZON-ECN Onderhoudsabonnementen</title>
        <meta name="description" content="Sluit direct een onderhoudsabonnement af voor uw CV-ketel, warmtepomp, airco of ander verwarmingstoestel" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background font-body antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <HeaderLanding />
            <main className="flex-1">{children}</main>
            <footer className="border-t bg-muted/30 py-4">
              <div className="container mx-auto px-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Copyright © 2025 Espelo Enterprises BV
                </p>
              </div>
            </footer>
          </div>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
