import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "./auth-form";
import { LockIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Logga in",
  description: "Logga in på Platsdela med e-post eller BankID.",
};

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center text-2xl font-bold tracking-tight">Välkommen till Platsdela</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Logga in eller skapa ett konto för att hyra ut och boka platser.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground opacity-60"
        >
          <LockIcon className="size-4" /> Fortsätt med BankID
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          BankID kopplas in via Criipto/Signicat (docs/07). Använd e-post nedan i demoläget.
        </p>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> eller <span className="h-px flex-1 bg-border" />
        </div>

        <AuthForm />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Genom att fortsätta godkänner du våra villkor och integritetspolicy.
      </p>
    </div>
  );
}
