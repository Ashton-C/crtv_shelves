"use client";

import { useState } from "react";
import type { Item } from "~/lib/mock-data";

interface ItemThumbProps {
  item: Item;
  size?: number;
  rank?: number | null;
}

export function ItemThumb({ item, size = 56, rank = null }: ItemThumbProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-[8px]"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${item.c1}, ${item.c2})` }}
      />
      {!imgError && (
        <img
          src={item.img}
          alt={item.name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      <div className="absolute inset-0 bg-black/25" />
      {imgError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/60">
          {item.init}
        </div>
      )}
      {rank !== null && (
        <div className="absolute right-1 bottom-0.5 text-[10px] font-black leading-none text-white/80">
          {rank}
        </div>
      )}
    </div>
  );
}

interface CollageTileProps {
  item: Item;
}

export function CollageTile({ item }: CollageTileProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative aspect-square overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${item.c1}, ${item.c2})` }}
    >
      {!imgError && (
        <img
          src={item.img}
          alt={item.name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {imgError && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/60">
          {item.init}
        </div>
      )}
    </div>
  );
}
