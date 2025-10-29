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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verwerkAircoContract } from "@/ai/flows/verwerk-airco-contract-flow";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";

const toestelSchema = z.object({
  merk: z.string().min(1, "Merk is verplicht."),
  type: z.string().min(1, "Type is verplicht."),
  bouwjaar: z.string().min(1, "Bouwjaar is verplicht."),
  serienummerBinnen: z.string().optional(),
  serienummerBuiten: z.string().optional(),
  abonnement: z.string().optional(),
});

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
  toestel1: toestelSchema,
  heeftExtraToestel: z.boolean().default(false),
  toestel2: toestelSchema.optional(),

  reisToeslag: z.string().optional(),

  // Betaling
  iban: z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/i, "Ongeldig IBAN-formaat."),

  akkoordVoorwaarden: z.literal(true, {
    errorMap: () => ({ message: "U moet akkoord gaan met de algemene voorwaarden." }),
  }),
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
    if (data.heeftExtraToestel) {
        return !!data.toestel2?.merk && !!data.toestel2?.abonnement;
    }
    return true;
}, {
    message: "Vul de gegevens voor het extra toestel in.",
    path: ["toestel2.merk"],
});


const abonnementen = [
    { value: "onderhoud_12", label: "Onderhoud 12 mnd (€12,10)" },
    { value: "onderhoud_18", label: "Onderhoud 18 mnd (€10,06)" },
    { value: "onderhoud_24", label: "Onderhoud 24 mnd (€8,09)" },
    { value: "serviceplus_12", label: "Service Plus 12 mnd (€18,17)" },
    { value: "serviceplus_18", label: "Service Plus 18 mnd (€14,09)" },
    { value: "serviceplus_24", label: "Service Plus 24 mnd (€11,08)" },
];

const abonnementPrijzen: Record<string, number> = {
  "onderhoud_12": 12.10,
  "onderhoud_18": 10.06,
  "onderhoud_24": 8.09,
  "serviceplus_12": 18.17,
  "serviceplus_18": 14.09,
  "serviceplus_24": 11.08
};

const voorrijdkostenPrijzen: Record<string, number> = {
  '15-30km': 5.75,
  '31-50km': 9.40
};

// Functie om de totale maandelijkse kosten te berekenen voor Airco
const berekenMaandelijkeKosten = (
  toestel1Abonnement: string | undefined,
  toestel2Abonnement: string | undefined,
  toeslag: string | undefined
): number | null => {
  let totaal = 0;

  if (toestel1Abonnement) {
    totaal += abonnementPrijzen[toestel1Abonnement] || 0;
  }

  if (toestel2Abonnement) {
    totaal += abonnementPrijzen[toestel2Abonnement] || 0;
  }

  if (toeslag) {
    totaal += voorrijdkostenPrijzen[toeslag] || 0;
  }

  return totaal > 0 ? totaal : null;
};

const ToestelCard = ({ form, toestelNum }: { form: any, toestelNum: 1 | 2 }) => {
  const fieldName = `toestel${toestelNum}` as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toestelgegevens Airconditioning {toestelNum > 1 ? `(extra toestel ${toestelNum -1})` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name={`${fieldName}.merk`} render={({ field }) => ( <FormItem><FormLabel>Merk *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name={`${fieldName}.bouwjaar`} render={({ field }) => ( <FormItem><FormLabel>Bouwjaar *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name={`${fieldName}.type`} render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Type *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name={`${fieldName}.serienummerBinnen`} render={({ field }) => ( <FormItem><FormLabel>Serienummer binnen-unit</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
          <FormField control={form.control} name={`${fieldName}.serienummerBuiten`} render={({ field }) => ( <FormItem><FormLabel>Serienummer buiten-unit</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        </div>
        <Separator />
        <FormField control={form.control} name={`${fieldName}.abonnement`} render={({ field }) => (
          <FormItem>
            <FormLabel>Onderhoudsabonnement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer onderhoudsabonnement" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {abonnementen.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </CardContent>
    </Card>
  );
};


export function AircoContractForm() {
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
      heeftExtraToestel: false,
      toestel1: { abonnement: "" },
      toestel2: { abonnement: "" },
      iban: "",
      akkoordVoorwaarden: false,
    },
  });
  
  const isAdresAfwijkend = form.watch("adresAfwijkend");
  const heeftExtraToestel = form.watch("heeftExtraToestel");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Bereken totale maandelijkse prijs
      const maandelijksePrijs = berekenMaandelijkeKosten(
        values.toestel1?.abonnement,
        values.heeftExtraToestel ? values.toestel2?.abonnement : undefined,
        values.toeslag
      );

      await verwerkAircoContract({ ...values, maandelijksePrijs: maandelijksePrijs || 0 });
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
              <FormField control={form.control} name="klantNaam" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Naam</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantAdres" render={({ field }) => ( <FormItem><FormLabel>Adres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantPostcode" render={({ field }) => ( <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantWoonplaats" render={({ field }) => ( <FormItem><FormLabel>Woonplaats</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantTelefoon" render={({ field }) => ( <FormItem><FormLabel>Telefoonnummer</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="klantEmail" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>E-mailadres</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
          </CardContent>
        </Card>

        <FormField control={form.control} name="adresAfwijkend" render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
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

        <ToestelCard form={form} toestelNum={1} />
        
        <FormField control={form.control} name="heeftExtraToestel" render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none"><FormLabel>Ik wil een extra toestel aanmelden</FormLabel></div>
            </FormItem>
        )} />

        {heeftExtraToestel && <ToestelCard form={form} toestelNum={2} />}

        <Card>
          <CardHeader><CardTitle>Toeslagen & Ingangsdatum</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="reisToeslag" render={({ field }) => (
              <FormItem>
                <FormLabel>Reis- en km-toeslag (optioneel)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Geen toeslag" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="geen">Geen toeslag</SelectItem>
                    <SelectItem value="15-30km">15-30 km (€5,75 per maand)</SelectItem>
                    <SelectItem value="31-50km">31-50 km (€9,40 per maand)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Alleen van toepassing indien u buiten ons standaard verzorgingsgebied woont
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <Separator />
            <div className="space-y-2">
              <FormLabel>Ingangsdatum onderhoudsabonnement</FormLabel>
              <p className="text-sm text-muted-foreground">
                Uw nieuwe onderhoudsabonnement zal ingaan per 1 januari 2026. De looptijd is standaard één jaar en wordt stilzwijgend verlengd.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Betaalgegevens</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="iban" render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN-nummer</FormLabel>
                <FormControl><Input {...field} placeholder="NL00BANK0123456789" /></FormControl>
                <FormDescription>
                  Het maandelijkse bedrag wordt automatisch geïncasseerd van dit rekeningnummer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Akkoord</CardTitle></CardHeader>
          <CardContent>
             <FormField control={form.control} name="akkoordVoorwaarden" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Ik ga akkoord met de <a href="/ZON_ECNI_Abelenco_ServiceAbonForm_Airco.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Algemene Voorwaarden Onderhoudsabonnement Airconditioning</a></FormLabel>
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
