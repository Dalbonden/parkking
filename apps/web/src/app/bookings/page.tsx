import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { getBookingsForRenter } from "@/lib/bookings";
import { formatSek, formatShortDate } from "@/lib/format";
import { categorySwatch } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mina bokningar",
  description: "Dina bokade platser på Platsdela.",
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Förfrågan",
  confirmed: "Bekräftad",
  active: "Pågående",
  completed: "Avslutad",
  cancelled: "Avbruten",
};

type SearchParams = Promise<{ success?: string }>;

export default async function BookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/bookings");

  const { success } = await searchParams;
  const bookings = await getBookingsForRenter(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Mina bokningar</h1>

      {success && (
        <div className="mt-4 rounded-xl border border-border bg-accent/40 p-4 text-sm">
          Tack! Din bokning är bekräftad. Betalningen hålls säkert tills bokningen startar.
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Du har inga bokningar ännu.{" "}
          <Link href="/listings" className="text-primary hover:underline">
            Hitta en plats
          </Link>
          .
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <span
                className="grid size-12 shrink-0 place-items-center rounded-lg text-white/90"
                style={{ backgroundColor: b.listing ? categorySwatch(b.listing.category) : "#2f6f57" }}
              >
                {b.listing && <CategoryIcon category={b.listing.category} className="size-6" />}
              </span>
              <div className="min-w-0 flex-1">
                {b.listing ? (
                  <Link href={`/listings/${b.listing.id}`} className="font-medium hover:text-primary">
                    {b.listing.title}
                  </Link>
                ) : (
                  <span className="font-medium">Plats borttagen</span>
                )}
                <div className="text-sm text-muted-foreground">
                  {b.listing ? `${b.listing.area}, ${b.listing.city} · ` : ""}
                  {formatShortDate(b.startDate)}–{formatShortDate(b.endDate)}
                </div>
                <div className="mt-1 flex gap-1.5">
                  <Badge variant="outline">{STATUS_LABEL[b.status] ?? b.status}</Badge>
                  {b.paymentStatus === "paid" ? (
                    <Badge variant="accent">Betald</Badge>
                  ) : (
                    <Badge variant="outline">Väntar på betalning</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatSek(b.amountTotal)}</div>
                <div className="text-xs text-muted-foreground">totalt</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/listings">Hitta fler platser</Link>
        </Button>
      </div>
    </div>
  );
}
