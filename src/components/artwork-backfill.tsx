"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { backfillShelfArtwork } from "~/server/actions/artwork";

/**
 * Fires a one-shot artwork backfill for a shelf whose items are missing cover
 * art, then refreshes so the resolved images appear.
 *
 * Rendered only for a viewer who may edit the shelf. Creation and saving stay
 * fast because the lookups happen here, after navigation, instead of inside
 * the write path — each lookup is a serial network round trip.
 */
export function ArtworkBackfill({ slug }: { slug: string }) {
  const router = useRouter();
  // Guards against the double-invoke of effects in React strict mode, which
  // would otherwise fire two concurrent backfills against rate-limited APIs.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        const res = await backfillShelfArtwork(slug);
        if (res.updated > 0) router.refresh();
      } catch {
        // Best effort — items keep their gradient placeholder.
      }
    })();
  }, [slug, router]);

  return null;
}
