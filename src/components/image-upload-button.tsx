"use client";

import { useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useUploadThing } from "~/lib/uploadthing-client";

/**
 * Compact upload control styled to match the app rather than UploadThing's
 * default button, so no vendor stylesheet import is needed.
 */
export function ImageUploadButton({
  onUploaded,
  label = "upload",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("shelfItemImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url;
      if (url) {
        onUploaded(url);
        setError(null);
      } else {
        setError("upload failed");
      }
    },
    onUploadError: (e: Error) => setError(e.message || "upload failed"),
  });

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void startUpload([file]);
          // Reset so picking the same file twice still fires onChange.
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        title={error ?? label}
        aria-label={label}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-muted transition-colors hover:text-accent disabled:opacity-40"
        style={error ? { color: "#ef4444" } : undefined}
      >
        <FiUpload size={14} className={isUploading ? "animate-pulse" : ""} />
      </button>
    </>
  );
}
