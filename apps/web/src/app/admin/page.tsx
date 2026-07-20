import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin, getModerationQueue } from "@/lib/admin";
import { AdminQueue } from "./admin-queue";

export const metadata: Metadata = {
  title: "Granskning",
  description: "Admin — granska platser och identiteter.",
  robots: { index: false, follow: false },
};

// Always render per-request; never cache moderation state.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ctx = await requireAdmin();
  // 404 (not 403/redirect) so the route's existence isn't revealed to non-admins.
  if (!ctx) notFound();

  const queue = await getModerationQueue(ctx.supabase);
  const total = queue.listings.length + queue.identities.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Granskning</h1>
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
          Admin
        </span>
      </div>
      <p className="mt-1 text-muted-foreground">
        {total === 0
          ? "Kön är tom — inget väntar på granskning just nu."
          : `${total} ärende${total === 1 ? "" : "n"} väntar på granskning.`}
      </p>

      <div className="mt-8">
        <AdminQueue listings={queue.listings} identities={queue.identities} />
      </div>
    </div>
  );
}
