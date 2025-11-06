"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { verwerkCvContract } from "@/ai/flows/verwerk-cv-contract-flow";

export const formSchema = z.object({
  // Klantgegevens
  klantNaam: z.string().min(2, "Naam is verplicht."),
  klantAdres: z.string().min(2, "Adres is verplicht."),
  klantPostcode: z.string().regex(/^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i, "Ongeldige postcode."),
  klantWoonplaats: z.string().min(2, "Woonplaats is verplicht."),
  klantTelefoon: z.string().min(10, "Ongeldig telefoonnummer."),
  klantEmail: z.string().email("Ongeldig e-mailadres."),

  // Toesteladres
  adresAfwijkend: z.boolean().default(false),
  toestelAdres: z.string().optional(),
  toestelPostcode: z.string().optional(),
  toestelWoonplaats: z.string().optional(),
  toestelTelefoon: z.string().optional(),
  
  // Toestelgegevens
  toestelMerk: z.string().min(1, "Merk toestel is verplicht."),
  toestelType: z.string().min(1, "Type toestel is verplicht."),
  toestelBouwjaar: z.string().min(1, "Bouwjaar is verplicht."),
  toestelSerienummer: z.string().min(1, "Serienummer is verplicht."),
  reedsinOnderhoud: z.enum(["ja", "nee"]).optional(),

  // Onderhoudsabonnement
  cvVermogen: z.enum(["tot-45kw", "45-70kw"], { required_error: "Kies een CV-vermogen." }),
  onderhoudsfrequentie: z.enum(["12", "18", "24"], { required_error: "Kies een onderhoudsfrequentie." }),
  typeAbonnement: z.enum(["onderhoud", "service-plus"], { required_error: "Kies een type abonnement." }),

  // Toeslag & Betaling
  voorrijdkosten: z.string().optional(),

  // Akkoord & ondertekening
  akkoordVoorwaarden: z.literal(true, {
    errorMap: () => ({ message: "U moet akkoord gaan met de algemene voorwaarden." }),
  }),
  iban: z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/i, "Ongeldig IBAN-formaat."),
})
.refine((data) => {
    if (data.adresAfwijkend) {
      return !!data.toestelAdres && !!data.toestelPostcode && !!data.toestelWoonplaats;
    }
    return true;
  }, {
    message: "Vul de afwijkende adresgegevens in.",
    path: ["toestelAdres"],
})
.refine((data) => {
    // Check if bouwjaar is 2015 or earlier
    const bouwjaar = parseInt(data.toestelBouwjaar);
    if (!isNaN(bouwjaar) && bouwjaar <= 2015) {
      return !!data.reedsinOnderhoud;
    }
    return true;
  }, {
    message: "Dit veld is verplicht voor CV-ketels van 2015 of ouder.",
    path: ["reedsinOnderhoud"],
});


// Prijzen per combinatie van CV-vermogen, frequentie en type abonnement
const prijzenMap: Record<string, Record<string, Record<string, number>>> = {
  'tot-45kw': {
    '12': {
      'onderhoud': 17.10,
      'service-plus': 23.17
    },
    '18': {
      'onderhoud': 13.06,
      'service-plus': 17.09
    },
    '24': {
      'onderhoud': 11.09,
      'service-plus': 14.08
    }
  },
  '45-70kw': {
    '12': {
      'onderhoud': 23.34,
      'service-plus': 32.35
    },
    '18': {
      'onderhoud': 17.52,
      'service-plus': 23.54
    },
    '24': {
      'onderhoud': 14.46,
      'service-plus': 18.96
    }
  }
};

const voorrijdkostenPrijzen: Record<string, number> = {
  '0-15km': 0,
  '15-30km': 5.75,
  '31-50km': 9.40
};

// Functie om de maandelijkse kosten te berekenen
const berekenMaandelijkeKosten = (
  cvVermogen: string | undefined,
  frequentie: string | undefined,
  typeAbonnement: string | undefined,
  voorrijdkosten: string | undefined
): number | null => {
  if (!cvVermogen || !frequentie || !typeAbonnement) return null;

  const basisPrijs = prijzenMap[cvVermogen]?.[frequentie]?.[typeAbonnement];
  if (basisPrijs === undefined) return null;

  const voorrijdkostenBedrag = voorrijdkosten ? (voorrijdkostenPrijzen[voorrijdkosten] || 0) : 0;

  return basisPrijs + voorrijdkostenBedrag;
};

export function CvContractForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      klantNaam: "",
      klantAdres: "",
      klantPostcode: "",
      klantWoonplaats: "",
      klantTelefoon: "",
      klantEmail: "",
      adresAfwijkend: false,
      toestelAdres: "",
      toestelPostcode: "",
      toestelWoonplaats: "",
      toestelTelefoon: "",
      toestelMerk: "",
      toestelType: "",
      toestelBouwjaar: "",
      toestelSerienummer: "",
      reedsinOnderhoud: undefined,
      cvVermogen: undefined,
      onderhoudsfrequentie: undefined,
      typeAbonnement: undefined,
      voorrijdkosten: "0-15km",
      iban: "",
      akkoordVoorwaarden: false,
    },
  });
  
  const isAdresAfwijkend = form.watch("adresAfwijkend");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Bereken totale maandelijkse prijs
      const maandelijksePrijs = berekenMaandelijkeKosten(
        values.cvVermogen,
        values.onderhoudsfrequentie,
        values.typeAbonnement,
        values.voorrijdkosten
      );

      await verwerkCvContract({ ...values, maandelijksePrijs: maandelijksePrijs || 0 });

      toast({
        title: "Inschrijving verstuurd!",
        description: "De gegevens zijn succesvol verstuurd en opgeslagen in de database.",
      });

      // Redirect to homepage after 1.5 seconds
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      console.error("Form submission failed:", error);
      toast({
          title: "Versturen mislukt",
          description: error.message || "Er is een onbekende fout opgetreden.",
          variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Klantgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="klantNaam" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Naam</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="klantAdres" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="klantPostcode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="klantWoonplaats" render={({ field }) => (
                <FormItem>
                  <FormLabel>Woonplaats</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="klantTelefoon" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefoonnummer</FormLabel>
                  <FormControl><Input type="tel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="klantEmail" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>E-mailadres</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <FormField control={form.control} name="adresAfwijkend" render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <FormLabel>Toesteladres is afwijkend</FormLabel>
                </div>
            </FormItem>
        )} />
        
        {isAdresAfwijkend && (
            <Card>
                <CardHeader><CardTitle>Toesteladres</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="toestelAdres" render={({ field }) => ( <FormItem><FormLabel>Adres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="toestelPostcode" render={({ field }) => ( <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="toestelWoonplaats" render={({ field }) => ( <FormItem><FormLabel>Woonplaats</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="toestelTelefoon" render={({ field }) => ( <FormItem><FormLabel>Telefoonnummer (optioneel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader><CardTitle>Toestelgegevens CV</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="toestelMerk" render={({ field }) => ( <FormItem><FormLabel>Merk toestel</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="toestelType" render={({ field }) => ( <FormItem><FormLabel>Type toestel</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="toestelBouwjaar" render={({ field }) => ( <FormItem><FormLabel>Bouwjaar</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="toestelSerienummer" render={({ field }) => ( <FormItem><FormLabel>Serienummer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>

                {(() => {
                  const bouwjaar = form.watch("toestelBouwjaar");
                  const bouwjaarNum = parseInt(bouwjaar);
                  if (!isNaN(bouwjaarNum) && bouwjaarNum <= 2015) {
                    const reedsinOnderhoud = form.watch("reedsinOnderhoud");
                    return (
                      <>
                        <FormField
                          control={form.control}
                          name="reedsinOnderhoud"
                          render={({ field }) => (
                            <FormItem className="space-y-3 border-t pt-4">
                              <FormLabel>Heeft u momenteel deze CV al in onderhoud bij ZON_ECN?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="ja" /></FormControl>
                                    <FormLabel className="font-normal">Ja</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="nee" /></FormControl>
                                    <FormLabel className="font-normal">Nee</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {reedsinOnderhoud === "nee" && (
                          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Let op!</strong> Bij het eerste bezoek zal onze monteur een inschatting maken of eerst een saneringsbeurt plaats moet vinden.
                            </p>
                          </div>
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onderhoudsabonnement</CardTitle>
            <CardDescription>Kies uw CV-vermogen, onderhoudsfrequentie en type abonnement om uw tarief zichtbaar te maken</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="cvVermogen" render={({ field }) => (
                <FormItem>
                  <FormLabel>CV-vermogen</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer vermogen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tot-45kw">Tot 45 kW</SelectItem>
                      <SelectItem value="45-70kw">45-70 kW</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="onderhoudsfrequentie" render={({ field }) => (
                <FormItem>
                  <FormLabel>Onderhoudsfrequentie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer frequentie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="12">12 maanden</SelectItem>
                      <SelectItem value="18">18 maanden</SelectItem>
                      <SelectItem value="24">24 maanden</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="typeAbonnement" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type abonnement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="onderhoud">Onderhoud</SelectItem>
                      <SelectItem value="service-plus">Service Plus</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {(() => {
              const cvVermogen = form.watch("cvVermogen");
              const frequentie = form.watch("onderhoudsfrequentie");
              const typeAbonnement = form.watch("typeAbonnement");
              const voorrijdkosten = form.watch("voorrijdkosten");
              const maandelijkseBedrag = berekenMaandelijkeKosten(cvVermogen, frequentie, typeAbonnement, voorrijdkosten);

              return maandelijkseBedrag !== null ? (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-medium">Totale maandelijkse kosten</p>
                  <p className="text-2xl font-bold text-primary">€{maandelijkseBedrag.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Inclusief eventuele voorrijdkosten</p>
                </div>
              ) : null;
            })()}

            <div className="space-y-3 pt-4 border-t">
              <FormField control={form.control} name="voorrijdkosten" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Voorrijdkosten (indien van toepassing)</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="0-15km" /></FormControl>
                        <FormLabel className="font-normal">0-15 km (geen kosten)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="15-30km" /></FormControl>
                        <FormLabel className="font-normal">15-30 km (€5,75)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="31-50km" /></FormControl>
                        <FormLabel className="font-normal">31-50 km (€9,40)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Selecteer alleen indien u buiten het standaard servicegebied woont. <a href="/gebied.png" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bekijk de kaart</a>
                  </FormDescription>
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Betaling & Akkoord</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <FormLabel>Ingangsdatum</FormLabel>
                    <p className="text-sm text-muted-foreground">
                        Uw nieuwe onderhoudsabonnement zal ingaan per 1 januari 2026. De looptijd is standaard één jaar en wordt stilzwijgend verlengd.
                    </p>
                </div>
                <FormField control={form.control} name="iban" render={({ field }) => (
                    <FormItem>
                        <FormLabel>IBAN</FormLabel>
                        <FormControl><Input placeholder="NL00BANK0000000000" {...field} /></FormControl>
                        <FormDescription>Voor de automatische incasso.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="akkoordVoorwaarden" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Ik ga akkoord met de <a href="/ZON_ECNI_Abelenco_ServiceAbonForm_CV.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">algemene voorwaarden cv onderhoudsabonnement</a></FormLabel>
                            <FormDescription>
                                Overeenkomstig de Algemene Voorwaarden machtigt de klant Abel&co
                                tot het incasseren van de maandelijkse vergoeding.
                            </FormDescription>
                            <FormMessage />
                        </div>
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (<><Loader2 className="animate-spin mr-2" /> Versturen...</>) : "Inschrijving Versturen"}
        </Button>
      </form>
    </Form>
  )
}