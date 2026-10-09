import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL ships native bindings for local SQLite files; keep it out of the bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // SQL migrations are read from disk at startup (src/instrumentation.ts).
  outputFileTracingIncludes: {
    "/*": ["./drizzle/**/*"],
    "/**": ["./drizzle/**/*"],
  },
  poweredByHeader: false,
};

export default nextConfig;
