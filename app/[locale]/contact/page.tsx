import { ContactForm } from './ContactForm';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'Contact — LOU STUDIO',
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { fr: '/fr/contact', en: '/en/contact' },
    },
  };
}

export default function ContactPage() {
  return (
    <main className="bg-jet text-cream relative min-h-screen px-6 pt-32 pb-16 md:px-20">
      <h1 className="text-brutal mb-16 text-7xl md:text-[14vw]">CONTACT</h1>
      <a
        href="mailto:hello@loustudio.fr"
        className="text-brutal hover:text-signal mb-16 block text-4xl md:text-6xl"
      >
        hello@loustudio.fr
      </a>
      <a
        href="https://instagram.com/loustudio"
        target="_blank"
        rel="noopener noreferrer"
        className="text-meta mb-24 block opacity-80 hover:opacity-100"
      >
        @LOUSTUDIO →
      </a>
      <ContactForm />
    </main>
  );
}
