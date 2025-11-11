// ZON-ECN Service Contract Forms - Updated Version
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Check, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function TarievenPage() {
  return (
    <>
      <section className="w-full py-12 md:py-20 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
            Onderhouds­abonnementen
          </h1>
          <p className="max-w-[700px] mx-auto mt-4 text-muted-foreground md:text-xl">
            Transparante en eerlijke prijzen voor service en onderhoud. Kies het abonnement dat bij u past.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-1">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Onderhoudsabonnementen</CardTitle>
                <CardDescription>Voorkom storingen en zorg voor een veilige en efficiënte installatie.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Toestel</TableHead>
                      <TableHead className="text-right">Direct Inschrijven</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">CV-ketel</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href="/zon-ecn">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Warmtepomp All-electric
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                           <Link href="/warmte">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Warmtepomp Hybride
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                           <Link href="/hybride-warmtepomp">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Warmtepomp Grondgebonden
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                           <Link href="/grondgebonden-warmtepomp">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Luchtverwarmer
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                           <Link href="/luchtverwarmer">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Airco
                         <div className="flex flex-col text-xs text-muted-foreground">
                            <span>(Single-split)</span>
                            <span>(Extra binnenunit)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                           <Link href="/airco">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2">
                      <TableCell colSpan={2} className="p-0">
                        <div className="bg-muted/30 p-4 rounded-md border border-muted">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Gasboiler*</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href="/gasboiler">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Gashaard / Kachel*</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href="/gashaard-kachel">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Geiser*</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href="/geiser">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Mechanische ventilatiebox (MV-box)*</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href="/mechanische-ventilatiebox">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Warmtepompboiler*</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href="/warmtepompboiler">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Warmte-Terugwin-Unit (WTW-unit)*</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href="/warmte-terugwin-unit">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Zonneboiler*</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href="/zonneboiler">Inschrijven <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          <div className="mt-2 text-sm text-muted-foreground">
                            * Deze units kunnen alleen met een hoofdtoestel erbij in onderhoud genomen worden. Vul aub ook één van de formulieren hierboven in!
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Vergelijk onze abonnementen</h2>
             <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl mt-4">
              Bekijk wat is inbegrepen in onze service- en onderhoudsabonnementen.
            </p>
           </div>
          <Card>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Service</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">Onderhoudsabonnement</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">Service Plus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs sm:text-sm">Periodiek onderhoud</TableCell>
                  <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs sm:text-sm">24/7 storingsdienst</TableCell>
                  <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs sm:text-sm">Voorrijkosten bij storing</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">Ja</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">Geen</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs sm:text-sm">Arbeidsloon bij storing</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">Uurloon</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">Geen</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs sm:text-sm">Korting op materiaalkosten</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">10%</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">10%</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="text-xs sm:text-sm">Prioriteit bij storingen</TableCell>
                  <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs sm:text-sm">Storing verhelpen</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">Betaald</TableCell>
                  <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs sm:text-sm">Voorwaarden bij nieuwe cliënten</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">Eventuele Saneringsbeurt</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">Eventuele Saneringsbeurt</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          {/* Servicegebied Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-6">Standaard Servicegebied</h3>
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl">
                <Image
                  src="/gebied.png"
                  alt="Standaard Servicegebied"
                  width={800}
                  height={600}
                  className="rounded-lg shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-8 space-y-2">
            <div>
              <Link href="/ZON_ECNI_Abelenco_ServiceAbon_voorwaarden.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Algemene Voorwaarden warmtepomp onderhoudsabonnement
              </Link>
            </div>
            <div>
              <Link href="/ZON_ECNI_Abelenco_ServiceAbonForm_CV.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Algemene Voorwaarden cv onderhoudsabonnement
              </Link>
            </div>
            <div>
              <Link href="/ZON_ECNI_Abelenco_ServiceAbonForm_Airco.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Algemene Voorwaarden airco onderhoudsabonnement
              </Link>
            </div>
            <div>
              <Link href="/ZON_ECNI_Abelenco_ServiceAbonForm_Blanco.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Algemene Voorwaarden algemeen onderhoudsabonnement
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
