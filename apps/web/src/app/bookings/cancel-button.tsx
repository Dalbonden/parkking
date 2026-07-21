"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { cancelBooking, type CancelState } from "./cancel-actions";

const INITIAL: CancelState = { status: "idle" };

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(cancelBooking, INITIAL);

  if (state.status === "success") {
    return <p className="text-sm text-muted-foreground">{state.message}</p>;
  }

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Avbokar…" : "Avboka"}
      </Button>
      {state.status === "error" && (
        <span className="text-xs text-destructive">{state.message}</span>
      )}
    </form>
  );
}
