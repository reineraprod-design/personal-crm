import { existsSync } from "node:fs";

// Next.js loads .env by itself; standalone scripts (drizzle-kit, seed) use this.
export function loadEnvFile() {
  if (existsSync(".env")) process.loadEnvFile(".env");
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in the values.");
  }
  return url;
}
