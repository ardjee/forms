import { ZonneboilerContractForm } from "@/components/ZonneboilerContractForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sun } from "lucide-react"
import Link from "next/link"

export default function ZonneboilerPage() {
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
        <Sun className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">
          Inschrijfformulier Onderhoudsabonnement Zonneboiler
        </h1>
      </div>

      <ZonneboilerContractForm />
    </div>
  )
}
