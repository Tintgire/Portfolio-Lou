import { locales } from '@/i18n';
import { IPhoneGLBLazy } from '@/components/contact/IPhoneGLBLazy';

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
    <main className="bg-jet text-cream relative min-h-screen overflow-hidden px-6 pt-32 pb-16 md:px-20">
      {/* Kick off the 16 MB GLB fetch as soon as the HTML is parsed,
          in parallel with the JS chunk that mounts the 3D scene. By
          the time useGLTF inside IPhoneGLB asks for the file, it's
          already in the browser cache → instant texture display, no
          progressive paint. */}
      <link
        rel="preload"
        as="fetch"
        type="model/gltf-binary"
        href="/models/iphone_14_pro.glb"
        crossOrigin="anonymous"
      />
      <div className="grid min-h-[calc(100vh-12rem)] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-8">
        {/* Left column — title + the two contact endpoints */}
        <div>
          <h1 className="text-brutal mb-12 text-7xl leading-none md:text-[10vw]">CONTACT.</h1>
          <a
            href="mailto:hello@loustudio.fr"
            className="text-brutal hover:text-signal mb-8 block text-3xl uppercase transition-colors md:text-5xl"
          >
            HELLO@LOUSTUDIO.FR
          </a>
          <a
            href="https://www.instagram.com/lou.boidin/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta inline-block opacity-80 transition-opacity hover:opacity-100"
          >
            @LOU.BOIDIN →
          </a>
        </div>

        {/* Right column — 3D iPhone displaying one of Lou's shots */}
        <div className="relative h-[60vh] w-full md:h-[80vh]">
          <IPhoneGLBLazy />
        </div>
      </div>

      {/* CC-BY-4.0 attribution required by the iPhone model's licence */}
      <p className="text-meta text-cream/40 absolute right-6 bottom-4 md:right-20">
        iPhone 14 Pro model by{' '}
        <a
          href="https://sketchfab.com/3d-models/iphone-14-pro-5cb0778041a34f09b409a38c687bb1d4"
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition-opacity hover:opacity-100"
        >
          mister dude
        </a>{' '}
        — CC-BY 4.0
      </p>
    </main>
  );
}
