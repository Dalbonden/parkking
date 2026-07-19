import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { ProfileForms } from "./profile-forms";

export const metadata: Metadata = {
  title: "Konto & identitet",
  description: "Hantera ditt konto, din profilbild och din identitetsverifiering.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/profile");

  const profile = await getProfile(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Konto &amp; identitet</h1>
      <p className="mt-1 text-muted-foreground">
        Bygg förtroende med en komplett profil — precis som en riktig marknadsplats.
      </p>
      <ProfileForms profile={profile} email={user.email ?? ""} />
    </div>
  );
}
