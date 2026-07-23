"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheckIcon } from "@/components/icons";
import { LiabilityNotice } from "@/components/liability-notice";
import { CATEGORIES } from "@/lib/types";
import { createListing, type CreateListingState } from "./actions";

const initialState: CreateListingState = { status: "idle" };

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-sm text-destructive">{msg}</p>;
}

export function ListSpaceForm() {
  const [state, formAction, pending] = useActionState(createListing, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-border bg-accent/40 p-6 text-center">
        <ShieldCheckIcon className="mx-auto size-9 text-primary" />
        <h2 className="mt-2 text-lg font-semibold">Inskickat!</h2>
        <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select id="category" name="category" defaultValue="parking">
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </Select>
        <FieldError msg={state.errors?.category} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Rubrik</Label>
        <Input id="title" name="title" placeholder="t.ex. Bevakad p-plats på Södermalm" />
        <FieldError msg={state.errors?.title} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Stad</Label>
          <Input id="city" name="city" placeholder="Stockholm" />
          <FieldError msg={state.errors?.city} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Område</Label>
          <Input id="area" name="area" placeholder="Södermalm" />
          <FieldError msg={state.errors?.area} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricePerMonth">Pris per månad (kr)</Label>
        <Input id="pricePerMonth" name="pricePerMonth" type="number" min={1} placeholder="1500" />
        <FieldError msg={state.errors?.pricePerMonth} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beskrivning</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Berätta om platsen, tillgänglighet och tillträde…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover">Bild på platsen (valfritt)</Label>
        <Input id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
        <p className="text-xs text-muted-foreground">
          En tydlig bild ger fler bokningar. JPG, PNG eller WEBP, max 6 MB.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Egenskaper</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="covered" className="size-4 accent-[var(--primary)]" /> Inomhus
          / skyddad
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="evCharging" className="size-4 accent-[var(--primary)]" />{" "}
          Elbilsladdning
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="access247" className="size-4 accent-[var(--primary)]" />{" "}
          Tillgång dygnet runt
        </label>
      </fieldset>

      {/* The key compliance gate — see docs/02-legal-and-compliance.md */}
      <div className="rounded-xl border border-border bg-accent/30 p-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="attestation"
            className="mt-0.5 size-4 accent-[var(--primary)]"
          />
          <span>
            Jag intygar att jag har <strong>rätt att hyra ut</strong> denna plats i andra hand — och
            att eventuellt samtycke från hyresvärd, bostadsrättsförening eller klubb finns.
          </span>
        </label>
        <FieldError msg={state.errors?.attestation} />
      </div>

      <LiabilityNotice context="host" />

      {state.status === "error" && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Skickar…" : "Publicera plats"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Det är gratis att lägga upp. Serviceavgift tas endast ut vid bokning.
      </p>
    </form>
  );
}
