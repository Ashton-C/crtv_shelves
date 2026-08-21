"use client";

/**
 * Labelled on/off row. Matches the switch styling used across the edit and
 * settings screens so toggles stay visually consistent.
 */
export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-[14px] border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-2 disabled:opacity-50"
    >
      <div className="min-w-0 pr-3">
        <p className="text-[13px] font-semibold text-text">{label}</p>
        {description && (
          <p className="text-[11px] text-muted">{description}</p>
        )}
      </div>
      <div
        className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
        style={{ background: checked ? "#FF5F00" : "#2E2D2D" }}
      >
        <div
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
        />
      </div>
    </button>
  );
}
