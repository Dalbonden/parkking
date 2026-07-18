import type { Metadata } from "next";
import { ListSpaceForm } from "./list-space-form";

export const metadata: Metadata = {
  title: "Hyr ut din plats",
  description: "Lägg upp din förhyrda parkering, garage, förråd eller båtplats på Platsdela.",
};

export default function ListSpacePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Hyr ut din plats</h1>
      <p className="mt-2 text-muted-foreground">
        Tjäna på en parkering, garage, förråd eller båtplats du redan betalar för. Det tar ett par
        minuter att lägga upp.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <ListSpaceForm />
      </div>
    </div>
  );
}
