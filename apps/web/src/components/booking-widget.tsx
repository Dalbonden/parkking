"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatSek } from "@/lib/format";
import { quote } from "@/lib/payments";
import type { BookingState } from "@/app/listings/[id]/booking-actions";

const MONTH_OPTIONS = [1, 2, 3, 6, 12];

export function BookingWidget({
  listingId,
  pricePerMonth,
  action,
}: {
  listingId: string;
  pricePerMonth: number;
  action: (state: BookingState, formData: FormData) => Promise<BookingState>;
}) {
  const [months, setMonths] = useState(1);
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as BookingState);
  const q = quote(pricePerMonth, months);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="listingId" value={listingId} />

      <div className="space-y-1.5">
        <label htmlFor="months" className="text-sm font-medium">
          Hyresperiod
        </label>
        <Select
          id="months"
          name="months"
          value={String(months)}
          onChange={(e) => setMonths(Number(e.target.value))}
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} {m === 1 ? "månad" : "månader"}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Hyra ({q.months} {q.months === 1 ? "mån" : "mån"})
          </span>
          <span>{formatSek(q.rent)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Serviceavgift</span>
          <span>{formatSek(q.renterFee)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold">
          <span>Totalt</span>
          <span>{formatSek(q.total)}</span>
        </div>
      </div>

      {state.status === "error" && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "…" : "Boka och betala"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Du debiteras säkert. Betalningen hålls i escrow tills bokningen startar.
      </p>
    </form>
  );
}
