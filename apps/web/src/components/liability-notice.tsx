import Link from "next/link";
import { ShieldIcon } from "@/components/icons";

/**
 * Compact intermediary/liability disclaimer shown at the points where a user
 * commits — booking a space or listing one. Makes clear the rental agreement is
 * between renter and host, and that Platsdela is a facilitator with limited
 * responsibility. Full terms live at /villkor.
 */
export function LiabilityNotice({ context }: { context: "renter" | "host" }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
      <div className="flex items-center gap-1.5 font-medium text-foreground">
        <ShieldIcon className="size-4 text-primary" /> Bra att veta
      </div>
      <p className="mt-2">
        {context === "renter" ? (
          <>
            Hyresavtalet ingås <strong>mellan dig och värden</strong>. Platsdela är en förmedlare —
            vi äger inte platsen och är inte part i avtalet. Värden ansvarar för att ha rätt att hyra
            ut platsen i andra hand, inklusive eventuellt samtycke från hyresvärd eller förening.
          </>
        ) : (
          <>
            Avtalet ingås <strong>mellan dig och hyresgästen</strong>. Du ansvarar själv för att du
            har <strong>rätt att hyra ut platsen i andra hand</strong> — inklusive nödvändigt samtycke
            från hyresvärd, bostadsrättsförening eller klubb. Platsdela förmedlar kontakten och
            betalningen men är inte part i avtalet.
          </>
        )}{" "}
        <Link href="/villkor" className="font-medium text-primary hover:underline">
          Läs våra villkor & ansvar
        </Link>
        .
      </p>
    </div>
  );
}
