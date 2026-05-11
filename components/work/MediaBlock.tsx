import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { Media } from '@/lib/works';
import { VideoBlock } from './VideoBlock';

const layoutClass: Record<Media['layout'], string> = {
  full: 'col-span-12 h-screen',
  'grid-left': 'col-span-12 md:col-span-7 aspect-[3/4]',
  'grid-right': 'col-span-12 md:col-span-5 md:col-start-8 aspect-[3/4]',
};

export function MediaBlock({ media }: { media: Media }) {
  const wrapper = cn('relative overflow-hidden', layoutClass[media.layout]);
  if (media.type === 'image') {
    return (
      <div className={wrapper}>
        <Image src={media.src} alt="" fill className="object-cover" sizes="100vw" />
      </div>
    );
  }
  return (
    <div className={wrapper}>
      <VideoBlock
        src={media.src}
        poster={media.poster}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
