import type { Work } from '@/lib/works';

export function Credits({ work }: { work: Work }) {
  const entries = Object.entries(work.team).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  );
  if (entries.length === 0) return null;
  return (
    <section className="border-cream/20 border-t px-6 py-16 md:px-20">
      <h2 className="text-meta mb-6 opacity-60">CREDITS</h2>
      <ul className="grid grid-cols-1 gap-y-3 md:grid-cols-2">
        {entries.map(([role, name]) => (
          <li key={role} className="border-cream/10 flex justify-between border-b py-3">
            <span className="text-meta opacity-70">{role.toUpperCase()}</span>
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
