/**
 * Pixora Supabase Client Configuration
 * Connected to project: resqvbekntvuvmxkuyvm
 * MCP Server: https://mcp.supabase.com/mcp?project_ref=resqvbekntvuvmxkuyvm
 */

export const SUPABASE_CONFIG = {
  projectRef: "resqvbekntvuvmxkuyvm",
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://resqvbekntvuvmxkuyvm.supabase.co",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  mcpServerUrl:
    "https://mcp.supabase.com/mcp?project_ref=resqvbekntvuvmxkuyvm&read_only=true&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage",
};

export const DEVELOPER_SECRET_KEYS = [
  "pixora_dev_resqvbekntvuvmxkuyvm",
  "pixora2026",
  "dev",
  "resqvbekntvuvmxkuyvm",
];

export function isDeveloperKeyValid(key?: string | null): boolean {
  if (!key) return false;
  const clean = key.trim();
  return DEVELOPER_SECRET_KEYS.includes(clean);
}
