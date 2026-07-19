import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "./auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Logga in",
  description: "Logga in eller skapa ett konto på Platsdela.",
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
        <AuthForm />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Efter registrering kan du fylla i din profil och verifiera din identitet. Genom att fortsätta
        godkänner du våra villkor och integritetspolicy.
      </p>
    </div>
  );
}
