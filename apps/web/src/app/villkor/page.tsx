import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Villkor & ansvar",
  description:
    "Platsdelas roll som förmedlare, ansvarsfördelning mellan hyresgäst, värd och hyresvärd, samt ansvarsbegränsning.",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function VillkorPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Villkor &amp; ansvar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Utkast · konceptstadiet. Sammanfattar hur Platsdela fungerar och hur ansvaret fördelas mellan
        hyresgäst, värd och eventuell hyresvärd. Detta är inte juridisk rådgivning.
      </p>

      <div className="mt-8 space-y-8">
        <Section id="formedlare" title="1. Platsdela är en förmedlare – inte part i avtalet">
          <p>
            Platsdela är en <strong>digital marknadsplats</strong> som kopplar samman den som vill
            hyra ut en plats (<strong>värden</strong>) med den som vill hyra den (
            <strong>hyresgästen</strong>). Vi äger inte, kontrollerar inte och besitter inte de platser
            som annonseras.
          </p>
          <p>
            <strong>Hyresavtalet ingås direkt mellan värden och hyresgästen.</strong> Platsdela är
            inte part i det avtalet och blir inte hyresvärd, uthyrare eller förvaltare. Vår roll är att
            tillhandahålla plattformen, förmedla kontakten och hantera betalningen.
          </p>
        </Section>

        <Section id="andrahand" title="2. Värdens ansvar för rätten att hyra ut">
          <p>
            Många platser hyrs ut i andra hand. <strong>Värden ansvarar ensam</strong> för att ha
            rätt att hyra ut platsen — inklusive nödvändigt samtycke från sin hyresvärd,
            bostadsrättsförening, parkeringsbolag eller båtklubb, samt för att uthyrningen är förenlig
            med värdens eget avtal och gällande regler.
          </p>
          <p>
            När värden publicerar en plats intygar hen detta. Platsdela kan begära in underlag men
            <strong> verifierar inte alltid</strong> varje uthyrningsrätt, och lämnar inga garantier
            för att en enskild uthyrning är tillåten. Värden håller Platsdela skadeslös för anspråk som
            uppstår till följd av att värden saknat rätt att hyra ut.
          </p>
        </Section>

        <Section id="vart-ansvar" title="3. Vad Platsdela ansvarar för">
          <p>Platsdela tar ansvar – inom rimliga gränser – för att:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>driva och underhålla plattformen och hantera konton och identitet;</li>
            <li>förmedla betalning via vår betalpartner (Stripe) med escrow-liknande hantering;</li>
            <li>granska annonser och identiteter i rimlig omfattning;</li>
            <li>ta emot och agera på anmälningar om olagligt eller olämpligt innehåll;</li>
            <li>ge tydlig information om priser, avgifter och villkor.</li>
          </ul>
          <p>
            Vi strävar efter en trygg marknadsplats, men kan inte garantera varje enskild parts
            uppträdande, en plats skick, tillgänglighet eller laglighet.
          </p>
        </Section>

        <Section id="inte-ansvar" title="4. Vad Platsdela inte ansvarar för">
          <p>Om inte annat följer av tvingande lag ansvarar Platsdela inte för:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>att en värd har rätt att hyra ut, eller följderna av att sådan rätt saknats;</li>
            <li>platsens skick, mått, säkerhet, tillgänglighet eller lämplighet;</li>
            <li>skada, stöld eller förlust som drabbar en parts egendom;</li>
            <li>tvister mellan hyresgäst och värd, eller mellan värd och dennes hyresvärd;</li>
            <li>indirekta skador, utebliven vinst eller förlust av data.</li>
          </ul>
        </Section>

        <Section id="begransning" title="5. Ansvarsbegränsning">
          <p>
            I den utsträckning lagen tillåter är Platsdelas samlade ansvar gentemot en användare för en
            enskild bokning <strong>begränsat till de serviceavgifter</strong> som Platsdela erhållit
            för just den bokningen.
          </p>
          <p>
            Denna begränsning inskränker inte de rättigheter som en konsument har enligt tvingande
            lagstiftning, och begränsar inte ansvar för skada som orsakats av grov vårdslöshet eller
            uppsåt.
          </p>
        </Section>

        <Section id="anmalan" title="6. Anmäl innehåll eller problem">
          <p>
            Ser du en annons som verkar sakna rätt till uthyrning, eller något olämpligt? Hör av dig så
            utreder vi och agerar. Vi tar bort innehåll som strider mot våra villkor eller lag.
          </p>
        </Section>

        <Section id="andringar" title="7. Ändringar">
          <p>
            Villkoren kan uppdateras. Väsentliga ändringar meddelas i tjänsten. Fortsatt användning
            efter en ändring innebär att du accepterar de uppdaterade villkoren.
          </p>
        </Section>
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
        Detta är en sammanfattning i klarspråk och ersätter inte fullständiga användarvillkor. Före
        lansering ska villkoren granskas av en svensk advokat. Se även vår översikt i{" "}
        <span className="font-medium text-foreground">docs/02 – legal &amp; compliance</span>.
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Till startsidan
        </Link>
      </div>
    </div>
  );
}
