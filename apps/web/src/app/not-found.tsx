import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl font-extrabold tracking-tight text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Sidan hittades inte</h1>
      <p className="mt-2 text-muted-foreground">
        Platsen eller sidan du letar efter finns inte längre — eller så flyttade den.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild>
          <Link href="/">Till startsidan</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/listings">Hitta plats</Link>
        </Button>
      </div>
    </div>
  );
}
