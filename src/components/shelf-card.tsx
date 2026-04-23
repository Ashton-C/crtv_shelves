import type { Shelf } from "~/lib/mock-data";
import { CollageTile } from "./item-thumb";
import { Badge } from "./badge";

interface ShelfCardProps {
  shelf: Shelf;
}

export function ShelfCard({ shelf }: ShelfCardProps) {
  const preview = shelf.items.slice(0, 4);
  const empty = Math.max(0, 4 - preview.length);

  return (
    <div className="cursor-pointer overflow-hidden rounded-[16px] border border-border bg-surface transition-transform duration-150 hover:scale-[0.97] active:scale-[0.97]">
      <div className="grid grid-cols-2 gap-[2px]">
        {preview.map((item) => (
          <CollageTile key={item.id} item={item} />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <div key={i} className="aspect-square bg-surface-2" />
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="truncate text-[12px] font-bold italic tracking-tight text-text">
          {shelf.name}
        </span>
        <Badge label={shelf.category} accent />
      </div>
    </div>
  );
}
