import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { getListingsForHost } from "@/lib/listings";
import { getBookingsForHost } from "@/lib/bookings";
import { formatSek, formatShortDate } from "@/lib/format";
import { CategoryIcon, ShieldCheckIcon } from "@/components/icons";

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

  const [profile, myListings, incoming] = await Promise.all([
    getProfile(user.id),
    getListingsForHost(user.id),
    getBookingsForHost(user.id),
  ]);
  const monthly = myListings.reduce((sum, l) => sum + l.pricePerMonth, 0);
  const earned = incoming
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.amountTotal - b.serviceFee), 0);

  const stats = [
    { label: "Mina platser", value: String(myListings.length) },
    { label: "Bokningar", value: String(incoming.length) },
    { label: "Intjänat (utbetalning)", value: formatSek(earned) },
    { label: "Potentiell intäkt / mån", value: formatSek(monthly) },
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

      {profile.idStatus !== "verified" && (
        <Link
          href="/profile"
          className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-accent/40 p-4 transition-colors hover:bg-accent/60"
        >
          <ShieldCheckIcon className="size-6 shrink-0 text-primary" />
          <div className="flex-1">
            <div className="font-medium">
              {profile.idStatus === "pending"
                ? "Din identitet granskas"
                : "Verifiera din identitet"}
            </div>
            <div className="text-sm text-muted-foreground">
              {profile.idStatus === "pending"
                ? "Vi återkommer när din legitimation har granskats."
                : "Ladda upp legitimation och fyll i din profil för att bygga förtroende."}
            </div>
          </div>
          <span className="text-sm font-medium text-primary">Till profilen →</span>
        </Link>
      )}

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

      <h2 className="mt-10 text-lg font-semibold">Inkommande bokningar</h2>
      {incoming.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Inga bokningar ännu.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {incoming.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium">{b.listing?.title ?? "Plats"}</div>
                <div className="text-sm text-muted-foreground">
                  {formatShortDate(b.startDate)}–{formatShortDate(b.endDate)}
                </div>
              </div>
              {b.paymentStatus === "paid" ? (
                <Badge variant="accent">Betald</Badge>
              ) : (
                <Badge variant="outline">Väntar</Badge>
              )}
              <div className="text-right">
                <div className="font-semibold">{formatSek(b.amountTotal - b.serviceFee)}</div>
                <div className="text-xs text-muted-foreground">din utbetalning</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Utbetalningar via Stripe Connect.</span> I
        demoläget bekräftas bokningar direkt. Lägg till Stripe-nycklar (se{" "}
        <code>.env.example</code>) för riktig kortbetalning i testläge, escrow och utbetalning till
        värdens konto. DAC7-rapportering kopplas in enligt docs/07.
      </div>
    </div>
  );
}
