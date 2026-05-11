import { MDXRemote } from 'next-mdx-remote/rsc';

export function Intro({ body }: { body: string }) {
  return (
    <section className="px-6 py-24 md:px-20">
      <div className="font-display max-w-3xl text-3xl leading-tight md:text-5xl">
        <MDXRemote source={body} />
      </div>
    </section>
  );
}
