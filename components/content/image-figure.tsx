import Image from "next/image";

type ImageFigureProps = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
};

export function ImageFigure({ src, alt, caption, priority = false }: ImageFigureProps) {
  return (
    <figure className="my-10 space-y-3">
      <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-ink-100 dark:border-ink-700 dark:bg-ink-800">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={840}
          priority={priority}
          className="h-auto w-full object-cover"
          sizes="(max-width: 768px) 100vw, 900px"
        />
      </div>
      {caption ? <figcaption className="text-center text-xs text-ink-500 dark:text-ink-400">{caption}</figcaption> : null}
    </figure>
  );
}
