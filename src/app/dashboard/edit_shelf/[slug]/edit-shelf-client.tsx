"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiMinus, FiSearch, FiTrash2 } from "react-icons/fi";
import { ItemSearchModal } from "~/components/item-search-modal";
import { ToggleRow } from "~/components/toggle-row";
import { inviteCollaborator, removeCollaborator } from "~/server/actions/collaborators";
import { deleteShelf, updateShelf } from "~/server/actions/shelves";

type ShelfSize = "podium" | "focus" | "archive";

type Collaborator = {
  id: string;
  handle: string;
  username: string;
  avatarColor: string;
  avatarInitials: string;
};

type Props = {
  shelf: {
    id: number;
    slug: string;
    name: string;
    category: string;
    type: string;
    size: ShelfSize;
    isCollaborative: boolean;
    isPrivate: boolean;
    items: { name: string; sub: string }[];
  };
  isOwner: boolean;
  collaborators: Collaborator[];
};

export default function EditShelfClient({ shelf, isOwner, collaborators }: Props) {
  const router = useRouter();
  const [name, setName] = useState(shelf.name);
  const [items, setItems] = useState(shelf.items);
  const [isCollaborative, setIsCollaborative] = useState(shelf.isCollaborative);
  const [isPrivate, setIsPrivate] = useState(shelf.isPrivate);
  const [modalSlot, setModalSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [inviteHandle, setInviteHandle] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  const update = (i: number, field: "name" | "sub", value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShelf(shelf.slug, {
        name: name.trim(),
        items,
        isCollaborative,
        isPrivate,
      });
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

  const handleInvite = async () => {
    const h = inviteHandle.trim();
    if (!h) return;
    setInviting(true);
    setInviteMessage("");
    try {
      await inviteCollaborator(shelf.slug, h);
      setInviteHandle("");
      setInviteMessage("invited!");
      router.refresh();
    } catch (e) {
      setInviteMessage(e instanceof Error ? e.message : "failed");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollab = async (collabUserId: string) => {
    try {
      await removeCollaborator(shelf.slug, collabUserId);
      router.refresh();
    } catch {
      // silent
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
          {isOwner ? (
            <button
              onClick={() => void handleDelete()}
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
          ) : (
            <div className="w-16" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Name — owner only */}
          {isOwner && (
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
          )}

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

          {/* Collaborative settings — owner only */}
          {isOwner && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
                visibility
              </p>
              <div className="mb-4">
                <ToggleRow
                  label="private shelf"
                  description={
                    isPrivate
                      ? "only you can see this — hidden from search, profiles and friends"
                      : "anyone with the link can see this shelf"
                  }
                  checked={isPrivate}
                  onChange={setIsPrivate}
                />
              </div>

              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
                collaboration
              </p>
              <ToggleRow
                label="allow collaborators"
                description="let friends add and edit items on this shelf"
                checked={isCollaborative}
                onChange={setIsCollaborative}
              />

              {isCollaborative && (
                <div className="mt-2 flex flex-col gap-2">
                  {/* Invite input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteHandle}
                      onChange={(e) => {
                        setInviteHandle(e.target.value);
                        setInviteMessage("");
                      }}
                      placeholder="@handle"
                      className="flex-1 rounded-[12px] border border-border bg-surface px-3 py-2.5 text-[13px] text-text placeholder-muted/50 outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => void handleInvite()}
                      disabled={inviting || !inviteHandle.trim()}
                      className="rounded-[12px] bg-accent px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-40"
                    >
                      {inviting ? "…" : "invite"}
                    </button>
                  </div>
                  {inviteMessage && (
                    <p
                      className="text-[12px] font-medium"
                      style={{
                        color:
                          inviteMessage === "invited!" ? "#FF5F00" : "#ef4444",
                      }}
                    >
                      {inviteMessage}
                    </p>
                  )}

                  {/* Current collaborators */}
                  {collaborators.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {collaborators.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 rounded-[12px] bg-surface px-3 py-2"
                        >
                          <div
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] text-[10px] font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${c.avatarColor}, ${c.avatarColor}99)`,
                            }}
                          >
                            {c.avatarInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-text">
                              {c.username}
                            </p>
                            <p className="text-[11px] text-muted">@{c.handle}</p>
                          </div>
                          <button
                            onClick={() => void handleRemoveCollab(c.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-surface-2 text-muted transition-colors hover:text-text"
                          >
                            <FiMinus size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="border-t border-border bg-bg p-4">
          <button
            onClick={() => void handleSave()}
            disabled={saving || (isOwner && !name.trim())}
            className="w-full rounded-[18px] py-4 text-[16px] font-bold transition-all disabled:opacity-30"
            style={{
              background:
                !saving && (!isOwner || name.trim()) ? "#FF5F00" : "#242323",
              color:
                !saving && (!isOwner || name.trim()) ? "#fff" : "#7A7775",
              boxShadow:
                !saving && (!isOwner || name.trim())
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
