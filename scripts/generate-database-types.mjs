import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const outputPath = join(repositoryRoot, "lib", "supabase", "database.types.ts");

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "supabase",
    "gen",
    "types",
    "typescript",
    "--local",
    "--schema",
    "api",
  ],
  {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === "win32",
    stdio: ["inherit", "pipe", "inherit"],
  },
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  console.error(
    "Database type generation failed; the tracked type file was not changed.",
  );
  process.exit(result.status ?? 1);
}

writeFileSync(outputPath, result.stdout, "utf8");
console.log(`Generated ${outputPath}`);
