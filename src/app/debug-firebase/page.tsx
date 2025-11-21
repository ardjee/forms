'use client';

import { firebaseProjectId } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DebugFirebasePage() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Gekopieerd!",
      description: "Project ID is naar klembord gekopieerd.",
    });
  };

  const openFirebaseConsole = () => {
    if (firebaseProjectId) {
      window.open(
        `https://console.firebase.google.com/project/${firebaseProjectId}/firestore/rules`,
        '_blank'
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Project Informatie</CardTitle>
          <CardDescription>
            Deze pagina toont het Firebase project ID dat gebruikt wordt door deze applicatie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {firebaseProjectId ? (
            <>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Project ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-background rounded text-sm font-mono">
                      {firebaseProjectId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(firebaseProjectId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {firebaseProjectId && firebaseProjectId.toLowerCase().includes('meterscan') && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-800 rounded">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                      ⚠️ WAARSCHUWING: Verkeerd Firebase Project!
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300 mb-2">
                      Dit project gebruikt momenteel "meterscan NL" Firebase project. Dit zou een eigen Firebase project moeten hebben.
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300">
                      Zie <code className="bg-background px-1 rounded">FIREBASE_SETUP.md</code> in de root van dit project voor instructies om dit op te lossen.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={openFirebaseConsole}
                  className="w-full"
                  variant="default"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Firestore Security Rules
                </Button>
                <p className="text-xs text-muted-foreground">
                  Dit opent de Firebase Console direct naar de Security Rules pagina voor dit project.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-semibold mb-2">Hoe de Security Rules te updaten:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside mb-3">
                  <li>Klik op de knop hierboven om naar Firebase Console te gaan</li>
                  <li>Ga naar het tabblad <strong>Rules</strong> (Regels)</li>
                  <li>Vervang ALLE bestaande rules met deze code:</li>
                </ol>
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1">Collecties die gebruikt worden:</p>
                  <ul className="text-xs list-disc list-inside space-y-1 text-muted-foreground">
                    <li><code>contracts</code> - Unified contracts collectie (hoofdcollectie)</li>
                    <li><code>cv-contract</code> - CV contracten (oude collectie, mogelijk nog in gebruik)</li>
                    <li><code>airco-contracten</code> - Airco contracten (oude collectie, mogelijk nog in gebruik)</li>
                    <li><code>warmtepomp-contracten</code> - Warmtepomp contracten (oude collectie, mogelijk nog in gebruik)</li>
                  </ul>
                </div>
                <pre className="mt-3 p-3 bg-background rounded text-xs overflow-x-auto border">
{`rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Unified contracts collectie (hoofdcollectie)
    match /contracts/{document=**} {
      allow read, write: if true;
    }
    
    // Oude collecties (voor backwards compatibility)
    match /cv-contract/{document=**} {
      allow read, write: if true;
    }
    
    match /airco-contracten/{document=**} {
      allow read, write: if true;
    }
    
    match /warmtepomp-contracten/{document=**} {
      allow read, write: if true;
    }
    
    // Blokkeer toegang tot alle andere collecties
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}
                </pre>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-xs font-semibold mb-1">⚠️ Belangrijk:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Zorg dat je ALLE oude rules verwijdert voordat je deze plakt</li>
                    <li>Klik op <strong>Publish</strong> na het plakken</li>
                    <li>Wacht 1-2 minuten na publiceren voordat je test</li>
                    <li>Refresh je browser pagina na het updaten van de rules</li>
                  </ul>
                </div>
                <p className="text-sm mt-3">
                  <strong>Let op:</strong> Deze rules geven volledige toegang. Voor productie zou je Firebase Authentication moeten gebruiken.
                </p>
              </div>
            </>
          ) : (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">
                Firebase Project ID is niet geconfigureerd. Controleer je environment variabelen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

