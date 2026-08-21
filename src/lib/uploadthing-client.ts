"use client";

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";

// Type-only import of the router, so no server code is pulled into the bundle.
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
