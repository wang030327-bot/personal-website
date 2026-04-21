import Image from "next/image";

type FeaturedItem = {
  title: string;
  subtitle: string;
  cover: string;
};

type FeaturedSectionProps = {
  items: FeaturedItem[];
};

export function FeaturedSection({ items }: FeaturedSectionProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-ink-200/70 bg-white/70 p-6 dark:border-ink-700 dark:bg-ink-900/70 md:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl text-ink-900 dark:text-ink-50">精选视觉</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400">来自近期内容的题图与配图</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="group space-y-3">
            <div className="overflow-hidden rounded-2xl border border-ink-200/70 dark:border-ink-700">
              <Image
                src={item.cover}
                alt={item.title}
                width={900}
                height={540}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div>
              <h3 className="font-medium text-ink-900 dark:text-ink-50">{item.title}</h3>
              <p className="text-sm text-ink-600 dark:text-ink-300">{item.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
