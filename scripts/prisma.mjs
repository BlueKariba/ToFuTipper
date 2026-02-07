import { spawnSync } from "node:child_process";
import path from "node:path";

const dbUrl = process.env.DATABASE_URL ?? "";
const isSqlite = dbUrl === "" || dbUrl.startsWith("file:");
const schema = isSqlite
  ? path.join("prisma", "schema.sqlite.prisma")
  : path.join("prisma", "schema.postgres.prisma");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Missing prisma command. Example: node scripts/prisma.mjs generate");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args, "--schema", schema], {
  stdio: "inherit"
});

process.exit(result.status ?? 1);
