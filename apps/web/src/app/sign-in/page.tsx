import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Logga in",
  description: "Logga in på Platsdela med BankID eller e-post.",
};

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center text-2xl font-bold tracking-tight">Logga in på Platsdela</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Verifiera dig tryggt. BankID rekommenderas för både uthyrare och hyresgäster.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <Button size="lg" className="w-full" disabled>
          🔐 Fortsätt med BankID
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          BankID kopplas in via Criipto/Signicat (se docs/07). Ej aktivt i demoläget.
        </p>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> eller <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input id="email" name="email" type="email" placeholder="din@epost.se" />
          </div>
          <Button variant="outline" className="w-full" disabled>
            Skicka inloggningslänk
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Genom att fortsätta godkänner du våra villkor och integritetspolicy.
      </p>
    </div>
  );
}
