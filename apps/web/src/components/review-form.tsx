"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createReview, type ReviewState } from "@/app/bookings/review-actions";

const initial: ReviewState = { status: "idle" };

const RATING_OPTIONS = [
  { value: 5, label: "5 – Utmärkt" },
  { value: 4, label: "4 – Bra" },
  { value: 3, label: "3 – Okej" },
  { value: 2, label: "2 – Mindre bra" },
  { value: 1, label: "1 – Dålig" },
];

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState(createReview, initial);

  if (state.status === "success") {
    return <p className="text-sm text-accent-foreground">{state.message}</p>;
  }

  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[9rem_1fr_auto] sm:items-start">
      <input type="hidden" name="bookingId" value={bookingId} />
      <Select name="rating" defaultValue="5" aria-label="Betyg">
        {RATING_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <Input name="comment" placeholder="Skriv ett omdöme (valfritt)" maxLength={280} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "…" : "Lämna omdöme"}
      </Button>
      {state.status === "error" && state.message && (
        <p className="text-sm text-destructive sm:col-span-3">{state.message}</p>
      )}
    </form>
  );
}
