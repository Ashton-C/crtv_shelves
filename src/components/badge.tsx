interface BadgeProps {
  label: string;
  accent?: boolean;
  large?: boolean;
}

export function Badge({ label, accent = false, large = false }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[6px] font-bold uppercase tracking-[0.5px]",
        large ? "px-2.5 py-1 text-[9px]" : "px-2 py-0.5 text-[9px]",
        accent
          ? "border border-accent bg-accent/15 text-accent"
          : "border border-border bg-surface-2 text-muted",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
