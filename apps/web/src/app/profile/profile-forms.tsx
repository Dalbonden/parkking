"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon } from "@/components/icons";
import { updateProfile, uploadAvatar, uploadIdDocument, type ProfileState } from "./actions";
import { ID_STATUS_LABEL, type Profile } from "@/lib/profile-types";

const initial: ProfileState = { status: "idle" };

function Feedback({ state }: { state: ProfileState }) {
  if (state.status === "success") return <p className="text-sm text-accent-foreground">{state.message}</p>;
  if (state.status === "error") return <p className="text-sm text-destructive">{state.message}</p>;
  return null;
}

function StatusBadge({ status }: { status: Profile["idStatus"] }) {
  return (
    <Badge variant={status === "verified" ? "accent" : "outline"}>
      {status === "verified" && <ShieldCheckIcon className="size-3.5" />}
      {ID_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ProfileForms({ profile, email }: { profile: Profile; email: string }) {
  const [detailsState, saveDetails, savingDetails] = useActionState(updateProfile, initial);
  const [avatarState, saveAvatar, savingAvatar] = useActionState(uploadAvatar, initial);
  const [idState, saveId, savingId] = useActionState(uploadIdDocument, initial);

  const initials = (profile.fullName ?? email).trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mt-8 space-y-5">
      {/* Profile photo */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Profilbild</h2>
        <div className="mt-4 flex items-center gap-4">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt="Profilbild"
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
              {initials}
            </span>
          )}
          <form action={saveAvatar} className="flex flex-wrap items-center gap-2">
            <Input
              type="file"
              name="file"
              accept="image/*"
              required
              className="h-10 max-w-64 py-2"
            />
            <Button type="submit" size="sm" variant="outline" disabled={savingAvatar}>
              {savingAvatar ? "Laddar upp…" : "Ladda upp"}
            </Button>
          </form>
        </div>
        <div className="mt-2">
          <Feedback state={avatarState} />
        </div>
      </section>

      {/* Details */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Personuppgifter</h2>
        <form action={saveDetails} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Visningsnamn</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.fullName ?? ""} placeholder="t.ex. Elin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalName">Juridiskt namn</Label>
              <Input
                id="legalName"
                name="legalName"
                defaultValue={profile.legalName ?? ""}
                placeholder="För- och efternamn enligt legitimation"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input id="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} placeholder="+46…" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Presentation</Label>
            <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} placeholder="Berätta kort om dig själv" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={savingDetails}>
              {savingDetails ? "Sparar…" : "Spara"}
            </Button>
            <Feedback state={detailsState} />
          </div>
        </form>
      </section>

      {/* Identity verification */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Identitetsverifiering</h2>
          <StatusBadge status={profile.idStatus} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Ladda upp en bild eller PDF av din legitimation (körkort, pass eller ID-kort). Den lagras
          säkert och privat — bara du och vårt granskningsteam kan se den.
        </p>
        {profile.idStatus === "verified" ? (
          <p className="mt-4 text-sm text-accent-foreground">Din identitet är verifierad.</p>
        ) : (
          <form action={saveId} className="mt-4 flex flex-wrap items-center gap-2">
            <Input
              type="file"
              name="file"
              accept="image/*,application/pdf"
              required
              className="h-10 max-w-72 py-2"
            />
            <Button type="submit" size="sm" disabled={savingId}>
              {savingId ? "Skickar…" : profile.idStatus === "pending" ? "Ladda upp igen" : "Skicka in"}
            </Button>
          </form>
        )}
        <div className="mt-2">
          <Feedback state={idState} />
        </div>
      </section>
    </div>
  );
}
