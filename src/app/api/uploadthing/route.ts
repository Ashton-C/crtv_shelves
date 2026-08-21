import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Reads UPLOADTHING_TOKEN from the environment. When the token is absent the
// handler still mounts — requests to it fail, but nothing calls it because the
// UI hides upload controls via isUploadEnabled().
export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
