export type TimelineItem = {
  period: string;
  title: string;
  place?: string;
  description?: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-2 border-l border-border">
      {items.map((item) => (
        <li key={`${item.period}-${item.title}`} className="relative pb-10 pl-8 last:pb-0">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[7px] size-3.5 rounded-full bg-accent ring-4 ring-bg"
          />
          <p className="text-sm font-semibold text-accent-text">{item.period}</p>
          <h3 className="mt-1 text-h3">{item.title}</h3>
          {item.place && <p className="mt-1 text-sm text-muted">{item.place}</p>}
          {item.description && <p className="mt-3 max-w-2xl text-muted">{item.description}</p>}
        </li>
      ))}
    </ol>
  );
}
