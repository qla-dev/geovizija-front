import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

// Privacy policy: what the site and its partners (Google AdSense) store, in plain language.
// Keep it in sync with what the code does (comments, localStorage, ads).
const UPDATED = '2. oktobar 2026.';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 mb-3">{title}</h2>
    <div className="space-y-3 text-stone-700 leading-relaxed">{children}</div>
  </section>
);

export const PrivacyPage: React.FC = () => (
  <div className="bg-white">
    <SEO title="Politika privatnosti | Geovizija" description="Kako Geovizija i njeni partneri koriste podatke i kolačiće." />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-5xl font-serif font-black text-stone-900 mb-2">Politika privatnosti</h1>
      <p className="text-sm text-stone-500 mb-8">Posljednja izmjena: {UPDATED}</p>

      <Section title="Ukratko">
        <p>Geovizija ne traži registraciju i ne prodaje podatke. Čitanje članaka i igranje kviza ne zahtijeva nikakve lične podatke. Oglase na stranici prikazuje Google AdSense, koji koristi kolačiće.</p>
      </Section>

      <Section title="Komentari">
        <p>Kada ostavite komentar, spremamo ime koje ste upisali, tekst komentara i vrijeme objave; ime i komentar su javno vidljivi uz članak. Radi zaštite od spama i zloupotrebe spremamo i jednosmjerno šifrovani (hash) otisak vaše IP adrese, iz kojeg se sama adresa ne može pročitati. Komentari prolaze automatsku moderaciju i možemo ih ukloniti.</p>
      </Section>

      <Section title="Podaci u vašem pregledniku">
        <p>Neke postavke čuvamo samo u vašem pregledniku (localStorage), ne na našem serveru: ime za komentare, komentare koje ste označili sa „sviđa mi se”, rezultate kviza i način prikaza liste članaka. Možete ih obrisati brisanjem podataka stranice u pregledniku.</p>
      </Section>

      <Section title="Oglasi i kolačići (Google AdSense)">
        <p>Oglase prikazuje Google. Google i njegovi partneri koriste kolačiće kako bi prikazivali oglase na osnovu vaših ranijih posjeta ovoj i drugim stranicama, mjerili uspješnost oglasa i spriječili prevare.</p>
        <p>Personalizovane oglase možete isključiti u <a href="https://adssettings.google.com" target="_blank" rel="noopener" className="text-geo-green font-semibold hover:underline">Google postavkama oglasa</a>. Više o tome kako Google koristi podatke: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener" className="text-geo-green font-semibold hover:underline">policies.google.com/technologies/partner-sites</a>. Kolačiće drugih ponuđača možete isključiti na <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener" className="text-geo-green font-semibold hover:underline">aboutads.info</a>.</p>
        <p>Posjetiocima iz Evropskog ekonomskog prostora i Ujedinjenog Kraljevstva Google prije prikaza personalizovanih oglasa traži pristanak.</p>
      </Section>

      <Section title="Društvene mreže">
        <p>Dugmad za dijeljenje otvaraju stranice Facebooka, X-a, WhatsAppa, Vibera, Telegrama, LinkedIna ili vaš e-mail program tek kada ih kliknete; do tada ti servisi ne dobijaju podatke od nas. Na njihovim stranicama važe njihova pravila privatnosti.</p>
      </Section>

      <Section title="Vaša prava">
        <p>Možete zatražiti uvid u podatke koje imamo o vama (npr. vaše komentare), njihovu ispravku ili brisanje. Javite nam se porukom na našoj <a href="https://www.facebook.com/profile.php?id=61594932783634" target="_blank" rel="noopener" className="text-geo-green font-semibold hover:underline">Facebook</a> ili <a href="https://www.instagram.com/geovizija/" target="_blank" rel="noopener" className="text-geo-green font-semibold hover:underline">Instagram</a> stranici i navedite članak i ime pod kojim ste komentarisali.</p>
      </Section>

      <Section title="Izmjene">
        <p>Ovu politiku možemo povremeno izmijeniti; datum posljednje izmjene je naveden na vrhu.</p>
      </Section>

      <Link to="/" className="inline-block mt-4 text-sm font-bold uppercase tracking-widest text-stone-900 border-b-2 border-geo-green pb-1 hover:text-geo-green">Natrag na naslovnu</Link>
    </div>
  </div>
);
