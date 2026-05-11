import { LipstickCanvas } from '@/components/three/LipstickCanvas';

export default function Home() {
  return (
    <main className="relative">
      <section className="h-screen">
        <LipstickCanvas />
      </section>
      <section className="bg-stone-1 h-screen" />
      <section className="bg-stone-2 h-screen" />
    </main>
  );
}
