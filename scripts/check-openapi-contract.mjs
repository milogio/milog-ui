import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const contracts = [
  ["contracts/public-api.oas.yaml", "lib/generated/public-api.ts"],
  ["contracts/ui-api.oas.yaml", "lib/generated/ui-api.ts"],
];

const temporaryDirectory = await mkdtemp(join(tmpdir(), "milog-openapi-"));

try {
  for (const [schemaPath, generatedPath] of contracts) {
    const temporaryOutput = join(temporaryDirectory, generatedPath.split("/").at(-1));
    const result = spawnSync(
      process.execPath,
      [resolve("node_modules/openapi-typescript/bin/cli.js"), resolve(schemaPath), "-o", temporaryOutput],
      { encoding: "utf8" },
    );

    if (result.status !== 0) {
      process.stderr.write(result.stderr || result.stdout);
      process.exitCode = result.status ?? 1;
      break;
    }

    const [expected, actual] = await Promise.all([
      readFile(resolve(generatedPath), "utf8"),
      readFile(temporaryOutput, "utf8"),
    ]);

    if (actual !== expected) {
      console.error(`${generatedPath} is out of date with ${schemaPath}. Run npm run contract:generate.`);
      process.exitCode = 1;
      break;
    }
  }

  if (!process.exitCode) console.log("OpenAPI-generated TypeScript contracts are current.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
