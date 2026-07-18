import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getListingsForHost } from "@/lib/listings";
import { formatSek } from "@/lib/format";
import { CategoryIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Min sida",
  description: "Översikt över dina platser, bokningar och utbetalningar.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Min sida</h1>
        <p className="mt-2 text-muted-foreground">
          Logga in för att se dina platser, bokningar och utbetalningar.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/sign-in">Logga in</Link>
        </Button>
      </div>
    );
  }

  const myListings = await getListingsForHost(user.id);
  const monthly = myListings.reduce((sum, l) => sum + l.pricePerMonth, 0);

  const stats = [
    { label: "Mina platser", value: String(myListings.length) },
    { label: "Potentiell intäkt / mån", value: formatSek(monthly) },
    { label: "Verifierad", value: "BankID" },
    { label: "Konto", value: user.email?.split("@")[0] ?? "–" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Min sida</h1>
          <p className="text-muted-foreground">Inloggad som {user.email}</p>
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
              <div className="mt-1 truncate text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Dina platser</h2>
      {myListings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Du har inga platser ännu.{" "}
          <Link href="/list-space" className="text-primary hover:underline">
            Lägg upp din första plats
          </Link>
          .
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {myListings.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <span
                className="grid size-12 shrink-0 place-items-center rounded-lg text-white/90"
                style={{ backgroundColor: l.swatch }}
              >
                <CategoryIcon category={l.category} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/listings/${l.id}`} className="font-medium hover:text-primary">
                  {l.title}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {l.area}, {l.city}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatSek(l.pricePerMonth)}</div>
                <div className="text-xs text-muted-foreground">/ månad</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Nya platser läggs upp som “under granskning”. Bokningar, utbetalningar (Stripe Connect) och
        DAC7-rapportering kopplas in enligt docs/07.
      </p>
    </div>
  );
}
