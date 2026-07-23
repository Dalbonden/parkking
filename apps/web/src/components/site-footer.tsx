import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-extrabold tracking-tight">
              Plats<span className="text-primary">dela</span>
            </div>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Marknadsplatsen för förhyrda platser — parkering, garage, förråd och båtplatser du
              redan betalar för men inte använder fullt ut.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/listings" className="hover:text-foreground">
              Hitta plats
            </Link>
            <Link href="/list-space" className="hover:text-foreground">
              Hyr ut
            </Link>
            <Link href="/sign-in" className="hover:text-foreground">
              Logga in
            </Link>
            <Link href="/villkor" className="hover:text-foreground">
              Villkor &amp; ansvar
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Platsdela (arbetsnamn) · Konceptstadiet. Detta är inte
          juridisk eller skatterådgivning.
        </p>
      </div>
    </footer>
  );
}
