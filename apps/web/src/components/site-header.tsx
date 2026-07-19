import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { signOut } from "@/app/sign-in/actions";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const initial = (profile?.fullName ?? user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            P
          </span>
          <span className="text-lg">
            Plats<span className="text-primary">dela</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/listings">Hitta plats</Link>
          </Button>
          {user && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">Bokningar</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Min sida</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile" aria-label="Konto & identitet" className="shrink-0">
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt="Profil"
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {initial}
                  </span>
                )}
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit">
                  Logga ut
                </Button>
              </form>
              <Button size="sm" asChild>
                <Link href="/list-space">Hyr ut din plats</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/sign-in">Logga in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/list-space">Hyr ut din plats</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
