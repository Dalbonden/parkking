"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon, ShieldCheckIcon, LockIcon } from "@/components/icons";
import { categoryMeta } from "@/lib/types";
import { formatSek } from "@/lib/format";
import {
  approveListing,
  rejectListing,
  approveIdentity,
  rejectIdentity,
} from "./actions";
import type {
  AdminActionState,
  PendingIdentity,
  PendingListing,
} from "@/lib/admin-types";

type Action = (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
const INITIAL: AdminActionState = { status: "idle" };

function ActionButton({
  action,
  field,
  value,
  label,
  variant = "default",
}: {
  action: Action;
  field: "listingId" | "userId";
  value: string;
  label: string;
  variant?: "default" | "outline" | "destructive";
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      <input type="hidden" name={field} value={value} />
      <Button type="submit" size="sm" variant={variant} disabled={pending}>
        {pending ? "…" : label}
      </Button>
      {state.status === "error" && (
        <span className="text-xs text-destructive">{state.message}</span>
      )}
    </form>
  );
}

export function AdminQueue({
  listings,
  identities,
}: {
  listings: PendingListing[];
  identities: PendingIdentity[];
}) {
  return (
    <div className="space-y-12">
      {/* Listings awaiting review */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          Platser för granskning
          <Badge variant={listings.length ? "primary" : "outline"}>{listings.length}</Badge>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Godkänn för att publicera platsen. Kontrollera särskilt att värden intygat rätt att hyra ut
          (andrahandsuthyrning).
        </p>

        {listings.length === 0 ? (
          <EmptyRow>Inga platser väntar på granskning.</EmptyRow>
        ) : (
          <div className="mt-4 space-y-3">
            {listings.map((l) => {
              const meta = categoryMeta(l.category);
              return (
                <Card key={l.id}>
                  <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-start">
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                      <CategoryIcon category={l.category} className="size-6" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{l.title}</span>
                        <Badge variant="outline">{meta.label}</Badge>
                        {l.consentVerified ? (
                          <Badge variant="accent">
                            <ShieldCheckIcon className="size-3" /> Samtycke intygat
                          </Badge>
                        ) : (
                          <Badge variant="outline">Samtycke ej intygat</Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {l.area}, {l.city} · {formatSek(l.pricePerMonth)}/mån
                      </div>
                      {l.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{l.description}</p>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Värd: {l.hostName ?? "—"}
                        {l.hostLegalName ? ` (${l.hostLegalName})` : ""} · Identitet:{" "}
                        <span className={l.hostIdStatus === "verified" ? "text-primary" : ""}>
                          {l.hostIdStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <ActionButton
                        action={approveListing}
                        field="listingId"
                        value={l.id}
                        label="Godkänn"
                      />
                      <ActionButton
                        action={rejectListing}
                        field="listingId"
                        value={l.id}
                        label="Avvisa"
                        variant="outline"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Identities awaiting verification */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          Identiteter för verifiering
          <Badge variant={identities.length ? "primary" : "outline"}>{identities.length}</Badge>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jämför uppladdad legitimation mot det juridiska namnet innan du verifierar.
        </p>

        {identities.length === 0 ? (
          <EmptyRow>Inga identiteter väntar på verifiering.</EmptyRow>
        ) : (
          <div className="mt-4 space-y-3">
            {identities.map((p) => (
              <Card key={p.userId}>
                <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-start">
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                      <ShieldCheckIcon className="size-6" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{p.fullName ?? "Namn saknas"}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Juridiskt namn: {p.legalName ?? "—"}
                      {p.phone ? ` · ${p.phone}` : ""}
                    </div>
                    <div className="mt-2">
                      {p.docUrl ? (
                        <a
                          href={p.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <LockIcon className="size-4" /> Visa legitimation (öppnas i ny flik)
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">Ingen fil uppladdad.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <ActionButton
                      action={approveIdentity}
                      field="userId"
                      value={p.userId}
                      label="Verifiera"
                    />
                    <ActionButton
                      action={rejectIdentity}
                      field="userId"
                      value={p.userId}
                      label="Avvisa"
                      variant="outline"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
