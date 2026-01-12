// Cloudflare Workers entry point
// This file is built separately for Cloudflare Workers deployment

import app from "./worker";

// Export for Cloudflare Workers
export default {
  fetch: app,
};
