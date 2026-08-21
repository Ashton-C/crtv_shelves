import { env } from "~/env";

/**
 * Uploads are optional. Without UPLOADTHING_TOKEN the route handler cannot
 * serve requests, so callers use this to hide upload controls rather than
 * showing a button that is guaranteed to fail.
 *
 * Server-only — it reads a non-public env var.
 */
export function isUploadEnabled() {
  return Boolean(env.UPLOADTHING_TOKEN);
}
