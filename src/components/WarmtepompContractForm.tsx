"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as React from "react";

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
import { verwerkWarmtepompContract } from "@/ai/flows/verwerk-warmtepomp-contract-flow";
import { useRouter } from "next/navigation";

export const formSchema = z.object({
  // Klantgegevens
  klantNaam: z.string().min(2, "Naam is verplicht."),
  klantAdres: z.string().min(2, "Adres is verplicht."),
  klantPostcode: z.string().min(1, "Postcode is verplicht.").regex(/^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i, "Ongeldige postcode."),
  klantWoonplaats: z.string().min(2, "Woonplaats is verplicht."),
  klantTelefoon: z.string().min(10, "Ongeldig telefoonnummer."),
  klantEmail: z.string().email("Ongeldig e-mailadres."),

  // Toesteladres
  adresAfwijkend: z.boolean().optional().default(false),
  toestelAdres: z.string().optional(),
  toestelPostcode: z.string().optional(),
  toestelWoonplaats: z.string().optional(),
  toestelTelefoon: z.string().optional(),
  
  // Gegevens warmtepompsysteem
  merkToestel: z.string().min(1, "Merk toestel is verplicht."),
  typeToestel: z.string().min(1, "Type toestel is verplicht."),
  bouwjaar: z.string().min(1, "Bouwjaar is verplicht."),
  serienummer: z.string().min(1, "Serienummer is verplicht."),
  
  // Onderhoudsabonnement
  systeemType: z.enum(["grondgebonden", "hybride", "all-electric"]).default("all-electric"),
  onderhoudsfrequentie: z.enum(["12", "18", "24"], { required_error: "Kies een onderhoudsfrequentie." }),
  typeAbonnement: z.enum(["onderhoud", "service-plus"], { required_error: "Kies een type abonnement." }),
  monitoring: z.enum(["ja", "nee"], { required_error: "Kies of u monitoring wilt." }),
  
  // Toeslag & Betaling
  voorrijdkosten: z.string().optional(),
  
  // Akkoord & ondertekening
  akkoordVoorwaarden: z.literal(true, {
    errorMap: () => ({ message: "U moet akkoord gaan met de algemene voorwaarden." }),
  }),
  iban: z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/i, "Ongeldig IBAN-formaat."),

}).refine((data) => {
    if (data.adresAfwijkend) {
      return !!data.toestelAdres && !!data.toestelPostcode && !!data.toestelWoonplaats;
    }
    return true;
  }, {
    message: "Vul de afwijkende adresgegevens in.",
    path: ["toestelAdres"],
});

// Prijzen per combinatie van frequentie en type abonnement
const prijzenMap: Record<string, Record<string, number>> = {
  '12': {
    'onderhoud': 12.10,
    'service-plus': 18.17
  },
  '18': {
    'onderhoud': 10.06,
    'service-plus': 14.09
  },
  '24': {
    'onderhoud': 8.09,
    'service-plus': 11.08
  }
};

const monitoringPrijs = 11.50;

const voorrijdkostenPrijzen: Record<string, number> = {
  '0-15km': 0,
  '15-30km': 5.75,
  '31-50km': 9.40
};

// Functie om de totale maandelijkse kosten te berekenen
const berekenMaandelijkeKosten = (
  frequentie: string | undefined,
  typeAbonnement: string | undefined,
  monitoring: string | undefined,
  voorrijdkosten: string | undefined
): number | null => {
  if (!frequentie || !typeAbonnement) return null;

  const basisPrijs = prijzenMap[frequentie]?.[typeAbonnement];
  if (basisPrijs === undefined) return null;

  const monitoringKosten = monitoring === 'ja' ? monitoringPrijs : 0;
  const voorrijdkostenKosten = voorrijdkosten ? (voorrijdkostenPrijzen[voorrijdkosten] || 0) : 0;

  return basisPrijs + monitoringKosten + voorrijdkostenKosten;
};

export function WarmtepompContractForm() {
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
      systeemType: "all-electric",
      onderhoudsfrequentie: undefined,
      typeAbonnement: undefined,
      monitoring: undefined,
      voorrijdkosten: "0-15km",
      akkoordVoorwaarden: false,
      iban: "",
    },
  });
  
  const isAdresAfwijkend = form.watch("adresAfwijkend");
  const geselecteerdeFrequentie = form.watch("onderhoudsfrequentie");
  const geselecteerdTypeAbonnement = form.watch("typeAbonnement");
  const geselecteerdeMonitoring = form.watch("monitoring");
  const geselecteerdeVoorrijdkosten = form.watch("voorrijdkosten");

  const maandelijkeKosten = berekenMaandelijkeKosten(
    geselecteerdeFrequentie,
    geselecteerdTypeAbonnement,
    geselecteerdeMonitoring,
    geselecteerdeVoorrijdkosten
  );

  const bouwjaarOptions = React.useMemo(() => {
    const currentYear = 2025;
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Bereken totale maandelijkse prijs
      const maandelijksePrijs = berekenMaandelijkeKosten(
        values.onderhoudsfrequentie,
        values.typeAbonnement,
        values.monitoring,
        values.voorrijdkosten
      );

      await verwerkWarmtepompContract({ ...values, maandelijksePrijs: maandelijksePrijs || 0 }, 'warmtepomp-all-electric');
      toast({
        title: "Inschrijving verstuurd!",
        description: "De gegevens zijn succesvol verstuurd en opgeslagen.",
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
          <CardHeader><CardTitle>Klantgegevens</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="klantNaam" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel required>Naam</FormLabel><FormControl><Input {...field} required /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantAdres" render={({ field }) => ( <FormItem><FormLabel required>Adres</FormLabel><FormControl><Input {...field} required /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantPostcode" render={({ field }) => ( <FormItem><FormLabel required>Postcode</FormLabel><FormControl><Input {...field} required /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantWoonplaats" render={({ field }) => ( <FormItem><FormLabel required>Woonplaats</FormLabel><FormControl><Input {...field} required /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantTelefoon" render={({ field }) => ( <FormItem><FormLabel required>Telefoonnummer</FormLabel><FormControl><Input type="tel" {...field} required /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantEmail" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel required>E-mailadres</FormLabel><FormControl><Input type="email" {...field} required /></FormControl><FormMessage /></FormItem> )} />
            </div>
          </CardContent>
        </Card>

        <FormField control={form.control} name="adresAfwijkend" render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    // Clear the fields when checkbox is unchecked
                    form.setValue("toestelAdres", "");
                    form.setValue("toestelPostcode", "");
                    form.setValue("toestelWoonplaats", "");
                    form.setValue("toestelTelefoon", "");
                  }
                }} /></FormControl>
                <div className="space-y-1 leading-none"><FormLabel>Toesteladres is afwijkend van debiteurenadres</FormLabel></div>
            </FormItem>
        )} />
        
        {isAdresAfwijkend && (
            <Card>
                <CardHeader><CardTitle>Afwijkend Toesteladres</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="toestelAdres" render={({ field }) => ( <FormItem><FormLabel>Adres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="toestelPostcode" render={({ field }) => ( <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="toestelWoonplaats" render={({ field }) => ( <FormItem><FormLabel>Woonplaats</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="toestelTelefoon" render={({ field }) => ( <FormItem><FormLabel>Telefoonnummer (optioneel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader><CardTitle>Gegevens Warmtepompsysteem</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="merkToestel" render={({ field }) => ( <FormItem><FormLabel required>Merk toestel</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="typeToestel" render={({ field }) => ( <FormItem><FormLabel required>Type toestel</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField
                        control={form.control}
                        name="bouwjaar"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel required>Bouwjaar</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Kies een bouwjaar" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {bouwjaarOptions.map((year) => (
                                    <SelectItem key={year} value={year}>
                                    {year}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="serienummer" render={({ field }) => ( <FormItem><FormLabel required>Serienummer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Onderhoudsabonnement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Abonnementstype</h3>
                  <p className="text-sm text-muted-foreground">Onderstaande bedragen zijn maandkosten. Bij Service Plus zit Onderhoud in. Monitoring is los van de keuze tussen Onderhoud en Service Plus.</p>
                </div>

                <FormField
                  control={form.control}
                  name="onderhoudsfrequentie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Onderhoudsfrequentie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kies een onderhoudsfrequentie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12">Elke 12 maanden</SelectItem>
                          <SelectItem value="18">Elke 18 maanden</SelectItem>
                          <SelectItem value="24">Elke 24 maanden</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="typeAbonnement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Type abonnement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kies een type abonnement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="onderhoud">Onderhoud (Periodieke onderhoudsbeurten)</SelectItem>
                          <SelectItem value="service-plus">Service Plus (Periodieke onderhoudsbeurten, verhelpen storingen, geen arbeidskosten, geen voorrijkosten)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monitoring"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Monitoring Warmtepomp</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kies of u monitoring wilt" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ja">Ja (€11,50 p.m.)</SelectItem>
                          <SelectItem value="nee">Nee</SelectItem>
                        </SelectContent>
                      </Select>
                      {field.value === "ja" && (
                        <p className="text-sm text-muted-foreground mt-2">* Indien mogelijk bij uw warmtepomptype. We gaan dit controleren.</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {maandelijkeKosten !== null && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm font-medium">Totale maandelijkse kosten</p>
                    <p className="text-2xl font-bold text-primary">€{maandelijkeKosten.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Inclusief eventuele monitoring en voorrijdkosten</p>
                  </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Toeslag & Betaling</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <FormField control={form.control} name="voorrijdkosten" render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Boven de 15 km is er een reis- en km-toeslag van toepassing:</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="0-15km" /></FormControl>
                                    <FormLabel className="font-normal">0-15 km (geen kosten)</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="15-30km" /></FormControl>
                                    <FormLabel className="font-normal">Bij 15-30 km à € 5,75 per maand</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="31-50km" /></FormControl>
                                    <FormLabel className="font-normal">Bij 31-50 km à € 9,40 per maand</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Akkoord & Ingangsdatum</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <FormLabel>Ingangsdatum</FormLabel>
                    <p className="text-sm text-muted-foreground">
                        Uw nieuwe onderhoudsabonnement zal ingaan per 1 januari 2026. De looptijd is standaard één jaar en wordt stilzwijgend verlengd.
                    </p>
                </div>

                <FormField control={form.control} name="akkoordVoorwaarden" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel required>Hierbij ga ik akkoord met de <a href="/ZON_ECNI_Abelenco_ServiceAbon_voorwaarden.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Algemene Voorwaarden Onderhoudsabonnement Warmtepomp</a></FormLabel>
                            <FormDescription>
                                Overeenkomstig de Algemene Voorwaarden machtigt de klant Abel&co
                                tot het incasseren van de maandelijkse vergoeding.
                            </FormDescription>
                            <FormMessage />
                        </div>
                    </FormItem>
                )} />

                 <FormField control={form.control} name="iban" render={({ field }) => (
                    <FormItem>
                        <FormLabel required>IBAN-nummer</FormLabel>
                        <FormControl><Input placeholder="NL00BANK0000000000" {...field} /></FormControl>
                        <FormMessage />
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
