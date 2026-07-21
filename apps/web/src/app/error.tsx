"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Replace with Sentry.captureException(error) once observability is wired.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Något gick fel</h1>
      <p className="mt-2 text-muted-foreground">
        Ett oväntat fel uppstod. Försök igen — går det inte, ladda om sidan om en stund.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Referens: {error.digest}</p>
      )}
      <Button className="mt-6" onClick={() => unstable_retry()}>
        Försök igen
      </Button>
    </div>
  );
}
