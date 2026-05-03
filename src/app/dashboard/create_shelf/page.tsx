"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { ItemSearchModal } from "~/components/item-search-modal";
import { StepDots } from "~/components/step-dots";
import {
  CATEGORIES,
  NAME_SUGGESTIONS,
  SHELF_SIZES,
  type Category,
} from "~/lib/mock-data";
import { createShelf } from "~/server/actions/shelves";

type Step = 1 | 2 | 3 | 4;
type ShelfSize = "podium" | "focus" | "archive";

function isStepValid(
  step: Step,
  state: { category: string; type: string; name: string; size: ShelfSize },
) {
  if (step === 1) return !!state.category && !!state.type;
  if (step === 2) return state.name.trim().length >= 2;
  if (step === 3) return !!state.size;
  return true;
}

// ── Step 1: Category ──────────────────────────────────────────────────────────

function Step1({
  category,
  type,
  setCategory,
  setType,
}: {
  category: string;
  type: string;
  setCategory: (v: string) => void;
  setType: (v: string) => void;
}) {
  const selected = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="mb-1 text-[13px] text-muted">Step 1 of 4</p>
        <h2 className="text-[22px] font-black italic tracking-tight">
          what category?
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {CATEGORIES.map((cat: Category) => {
          const isSelected = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setType("");
              }}
              className="flex flex-col items-center gap-2 rounded-[16px] border p-4 text-center transition-all duration-200"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${cat.c1}, ${cat.c2})`
                  : "#1C1B1B",
                borderColor: isSelected ? cat.c1 : "#2E2D2D",
              }}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span
                className={`text-[13px] font-bold ${isSelected ? "text-white" : "text-text"}`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {selected.types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="rounded-[12px] px-4 py-2 text-[13px] font-semibold transition-colors"
              style={{
                background: type === t ? "#FF5F00" : "#242323",
                color: type === t ? "#fff" : "#7A7775",
              }}
            >
              {t}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── Step 2: Name ──────────────────────────────────────────────────────────────

function Step2({
  categoryId,
  name,
  setName,
}: {
  categoryId: string;
  name: string;
  setName: (v: string) => void;
}) {
  const suggestions = NAME_SUGGESTIONS[categoryId] ?? [];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="mb-1 text-[13px] text-muted">Step 2 of 4</p>
        <h2 className="text-[22px] font-black italic tracking-tight">
          name your shelf
        </h2>
      </div>

      <div className="relative">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase().slice(0, 32))}
          placeholder="e.g. top artists"
          className="w-full rounded-[16px] border bg-surface px-4 py-3.5 text-[18px] font-bold italic tracking-tight text-text placeholder-muted/50 outline-none transition-colors"
          style={{ borderColor: name ? "#FF5F00" : "#2E2D2D" }}
        />
        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[12px] text-muted">
          {name.length}/32
        </span>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setName(s)}
              className="rounded-[12px] px-3 py-1.5 text-[12px] font-medium transition-all"
              style={{
                background: name === s ? "rgba(0,204,136,0.12)" : "#242323",
                color: name === s ? "#00cc88" : "#7A7775",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: name === s ? "#00cc88" : "transparent",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 3: Format / Size ─────────────────────────────────────────────────────

function Step3({
  size,
  onSizeChange,
}: {
  size: ShelfSize;
  onSizeChange: (s: ShelfSize) => void;
}) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="mb-1 text-[13px] text-muted">Step 3 of 4</p>
        <h2 className="text-[22px] font-black italic tracking-tight">
          choose a format
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {SHELF_SIZES.map((s) => {
          const isSelected = size === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSizeChange(s.id)}
              className="flex items-center gap-4 rounded-[16px] border p-4 text-left transition-all duration-200"
              style={{
                background: isSelected ? "rgba(245,158,11,0.08)" : "#1C1B1B",
                borderColor: isSelected ? "#F59E0B" : "#2E2D2D",
              }}
            >
              <span
                className="text-[28px] font-black leading-none"
                style={{ color: isSelected ? "#F59E0B" : "#7A7775" }}
              >
                {s.count}
              </span>
              <div className="flex-1">
                <div
                  className="text-[15px] font-bold"
                  style={{ color: isSelected ? "#F59E0B" : "#F0EEEC" }}
                >
                  {s.label}
                </div>
                <div className="text-[12px] text-muted">{s.desc}</div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: s.count }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-5 rounded-[4px]"
                    style={{
                      background: isSelected
                        ? "rgba(245,158,11,0.3)"
                        : "#242323",
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 4: Curation ──────────────────────────────────────────────────────────

function Step4({
  category,
  items,
  setItems,
}: {
  category: string;
  items: { name: string; sub: string }[];
  setItems: (items: { name: string; sub: string }[]) => void;
}) {
  const [modalSlot, setModalSlot] = useState<number | null>(null);

  const update = (i: number, field: "name" | "sub", value: string) => {
    const next = items.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item,
    );
    setItems(next);
  };

  const handleAdd = (i: number, picked: { name: string; sub: string }) => {
    const next = items.map((item, idx) => (idx === i ? picked : item));
    setItems(next);
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="mb-1 text-[13px] text-muted">Step 4 of 4</p>
          <h2 className="text-[22px] font-black italic tracking-tight">
            fill your shelf
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-[14px] border border-border bg-surface p-3"
            >
              <span
                className="mt-0.5 w-6 flex-shrink-0 text-right text-[13px] font-black"
                style={{ color: i === 0 ? "#FF5F00" : "#7A7775" }}
              >
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                  placeholder={`#${i + 1} name`}
                  className="w-full bg-transparent text-[14px] font-bold text-text placeholder-muted/40 outline-none"
                />
                <input
                  type="text"
                  value={item.sub}
                  onChange={(e) => update(i, "sub", e.target.value)}
                  placeholder="subtitle (optional)"
                  className="w-full bg-transparent text-[11px] font-medium text-muted placeholder-muted/40 outline-none"
                />
              </div>
              <button
                onClick={() => setModalSlot(i)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-muted transition-colors hover:text-accent"
              >
                <FiSearch size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modalSlot !== null && (
          <ItemSearchModal
            category={category}
            slotIndex={modalSlot}
            onAdd={(picked) => handleAdd(modalSlot, picked)}
            onClose={() => setModalSlot(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateShelfPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState<ShelfSize>("focus");
  const [items, setItems] = useState<{ name: string; sub: string }[]>(
    Array(5).fill({ name: "", sub: "" }),
  );

  const handleSizeChange = (s: ShelfSize) => {
    setSize(s);
    const count = { podium: 3, focus: 5, archive: 8 }[s];
    setItems(Array(count).fill({ name: "", sub: "" }));
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
    else router.back();
  };

  const goNext = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
  };

  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const result = await createShelf({ name, category, type, size, items });
      router.push(`/dashboard/view_shelf/${result.slug}`);
    } catch {
      setSaving(false);
    }
  };

  const valid = isStepValid(step, { category, type, name, size });
  const canCreate = step === 4 && items.some((item) => item.name.trim());

  return (
    <div className="flex min-h-full flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={goBack}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-text transition-colors hover:bg-surface-2"
        >
          <FiArrowLeft size={18} />
        </button>
        <div className="flex flex-1 justify-center">
          <StepDots total={4} current={step} />
        </div>
        <div className="w-9" />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.12 }}
          >
            {step === 1 && (
              <Step1
                category={category}
                type={type}
                setCategory={setCategory}
                setType={setType}
              />
            )}
            {step === 2 && (
              <Step2 categoryId={category} name={name} setName={setName} />
            )}
            {step === 3 && (
              <Step3 size={size} onSizeChange={handleSizeChange} />
            )}
            {step === 4 && (
              <Step4
                category={category}
                items={items}
                setItems={setItems}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border bg-bg p-4">
        {step < 4 ? (
          <button
            onClick={goNext}
            disabled={!valid}
            className="w-full rounded-[18px] py-4 text-[16px] font-bold transition-all disabled:opacity-30"
            style={{
              background: valid ? "#FF5F00" : "#242323",
              color: valid ? "#fff" : "#7A7775",
              boxShadow: valid ? "0 4px 20px rgba(255,95,0,0.4)" : "none",
            }}
          >
            continue →
          </button>
        ) : (
          <button
            onClick={() => void handleCreate()}
            disabled={!canCreate || saving}
            className="w-full rounded-[18px] py-4 text-[16px] font-bold transition-all disabled:opacity-30"
            style={{
              background: canCreate && !saving ? "#FF5F00" : "#242323",
              color: canCreate && !saving ? "#fff" : "#7A7775",
              boxShadow:
                canCreate && !saving ? "0 4px 20px rgba(255,95,0,0.4)" : "none",
            }}
          >
            {saving ? "saving…" : "create shelf"}
          </button>
        )}
      </div>
    </div>
  );
}
