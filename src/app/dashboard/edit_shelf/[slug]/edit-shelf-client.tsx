"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiSearch, FiTrash2 } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";
import { updateShelf, deleteShelf } from "~/server/actions/shelves";
import { ItemSearchModal } from "~/components/item-search-modal";

type ShelfSize = "podium" | "focus" | "archive";

type Props = {
  shelf: {
    id: number;
    slug: string;
    name: string;
    category: string;
    type: string;
    size: ShelfSize;
    items: { name: string; sub: string }[];
  };
};

export default function EditShelfClient({ shelf }: Props) {
  const router = useRouter();
  const [name, setName] = useState(shelf.name);
  const [items, setItems] = useState(shelf.items);
  const [modalSlot, setModalSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = (i: number, field: "name" | "sub", value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShelf(shelf.slug, { name: name.trim(), items });
      router.push(`/dashboard/view_shelf/${shelf.slug}`);
    } catch {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteShelf(shelf.slug);
      router.push("/dashboard");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-col bg-bg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-text transition-colors hover:bg-surface-2"
          >
            <FiArrowLeft size={18} />
          </button>
          <span className="text-[14px] font-bold text-text">edit shelf</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[12px] font-semibold transition-colors"
            style={{
              background: confirmDelete ? "rgba(239,68,68,0.15)" : "#1C1B1B",
              color: confirmDelete ? "#ef4444" : "#7A7775",
            }}
          >
            <FiTrash2 size={14} />
            {confirmDelete ? "sure?" : "delete"}
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Name */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
              shelf name
            </p>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value.toLowerCase().slice(0, 32))
                }
                className="w-full rounded-[16px] border bg-surface px-4 py-3.5 text-[18px] font-bold italic tracking-tight text-text placeholder-muted/50 outline-none transition-colors"
                style={{ borderColor: name ? "#FF5F00" : "#2E2D2D" }}
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[12px] text-muted">
                {name.length}/32
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
              items
            </p>
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
        </div>

        {/* Save button */}
        <div className="border-t border-border bg-bg p-4">
          <button
            onClick={() => void handleSave()}
            disabled={saving || !name.trim()}
            className="w-full rounded-[18px] py-4 text-[16px] font-bold transition-all disabled:opacity-30"
            style={{
              background: !saving && name.trim() ? "#FF5F00" : "#242323",
              color: !saving && name.trim() ? "#fff" : "#7A7775",
              boxShadow:
                !saving && name.trim()
                  ? "0 4px 20px rgba(255,95,0,0.4)"
                  : "none",
            }}
          >
            {saving ? "saving…" : "save changes"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modalSlot !== null && (
          <ItemSearchModal
            category={shelf.category}
            slotIndex={modalSlot}
            onAdd={(picked) => {
              setItems((prev) =>
                prev.map((item, idx) => (idx === modalSlot ? picked : item)),
              );
            }}
            onClose={() => setModalSlot(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
