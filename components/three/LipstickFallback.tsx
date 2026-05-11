import Image from 'next/image';

export function LipstickFallback() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center">
      <Image
        src="/lipstick-fallback.png"
        alt=""
        width={400}
        height={600}
        priority
        className="opacity-90"
      />
    </div>
  );
}
