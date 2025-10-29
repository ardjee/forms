import { GashaardKachelContractForm } from "@/components/GashaardKachelContractForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Flame } from "lucide-react"
import Link from "next/link"

export default function GashaardKachelPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Flame className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">
          Inschrijfformulier Onderhoudsabonnement Gashaard / Kachel
        </h1>
      </div>

      <GashaardKachelContractForm />
    </div>
  )
}
