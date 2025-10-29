"use client";

import { GasboilerContractForm } from '@/components/GasboilerContractForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ServiceGasboilerPage() {
  return (
    <div className="flex flex-col bg-background">
      <main className="flex-1 py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl shadow-lg">
              <CardContent className="pt-6">
                <Button asChild variant="ghost" className="mb-4">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Terug
                  </Link>
                </Button>
              </CardContent>
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                  <Flame className="h-10 w-10" />
                </div>
                <CardTitle className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Inschrijfformulier Onderhoudsabonnement Gasboiler
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base/relaxed max-w-3xl mx-auto pt-4 text-left space-y-3">
                  <p>
                    Met dit formulier kunt u zich direct inschrijven voor een onderhoudsabonnement voor uw gasboiler. Goed onderhoud is essentieel voor een duurzame en efficiënte werking van uw systeem.
                  </p>
                  <p>Vul de onderstaande gegevens zo volledig mogelijk in.</p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GasboilerContractForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
