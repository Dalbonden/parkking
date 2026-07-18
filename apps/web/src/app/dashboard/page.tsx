import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getListings } from "@/lib/listings";
import { formatSek } from "@/lib/format";
import { categoryMeta } from "@/lib/types";

export const metadata: Metadata = {
  title: "Min sida",
  description: "Översikt över dina platser, bokningar och utbetalningar.",
};

export default async function DashboardPage() {
  // Demo: treat the first few listings as "yours".
  const myListings = (await getListings()).slice(0, 3);
  const monthly = myListings.reduce((sum, l) => sum + l.pricePerMonth, 0);

  const stats = [
    { label: "Aktiva platser", value: String(myListings.length) },
    { label: "Intäkt / månad", value: formatSek(monthly) },
    { label: "Beläggning", value: "78%" },
    { label: "Snittbetyg", value: "4,8 ★" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Min sida</h1>
          <p className="text-muted-foreground">Demoöversikt för uthyrare</p>
        </div>
        <Button asChild>
          <Link href="/list-space">+ Lägg upp ny plats</Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Dina platser</h2>
      <div className="mt-4 space-y-3">
        {myListings.map((l) => (
          <div
            key={l.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <span
              className="grid size-12 shrink-0 place-items-center rounded-lg text-2xl"
              style={{ backgroundColor: l.swatch }}
            >
              {categoryMeta(l.category).emoji}
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/listings/${l.id}`} className="font-medium hover:text-primary">
                {l.title}
              </Link>
              <div className="text-sm text-muted-foreground">
                {l.area}, {l.city}
              </div>
            </div>
            <div className="hidden sm:block">
              {l.consentVerified ? (
                <Badge variant="accent">✓ Samtycke</Badge>
              ) : (
                <Badge variant="outline">Samtycke saknas</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatSek(l.pricePerMonth)}</div>
              <div className="text-xs text-muted-foreground">/ månad</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Detta är en demoöversikt. Riktiga bokningar, utbetalningar (Stripe Connect) och
        DAC7-rapportering kopplas in enligt docs/07.
      </p>
    </div>
  );
}
