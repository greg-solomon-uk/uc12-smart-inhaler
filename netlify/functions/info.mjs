import { CONTENT_VERSION } from "../../src/sources.js";

export default async () => Response.json({
  version: process.env.APP_VERSION || "1.0.0",
  commit: process.env.COMMIT_REF || process.env.COMMIT_SHA || "local",
  contentVersion: CONTENT_VERSION
});
