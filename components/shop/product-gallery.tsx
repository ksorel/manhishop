"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const gallery = images.length > 0 ? images : ["/img/placeholder-product.svg"];
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded bg-surface">
        <Image
          src={gallery[selected]}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`${alt} ${index + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded border",
                index === selected ? "border-primary" : "border-border",
              )}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
