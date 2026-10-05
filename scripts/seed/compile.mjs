import fs from "node:fs";
import path from "node:path";
import { validateSeedBundle } from "./validate.mjs";

const input = process.argv[2] ?? "seed/fixtures/minimal-valid.json";
const output = process.argv[3] ?? ".seed-output/import-plan.json";
const bundle = JSON.parse(fs.readFileSync(input, "utf8"));
const errors = validateSeedBundle(bundle);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const plan = {
  contractVersion: bundle.version,
  generatedAt: new Date().toISOString(),
  counts: Object.fromEntries(["sources", "anchors", "attributes", "problems", "audiences", "products", "escapeRoutes"].map((key) => [key, bundle[key].length])),
  bundle
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`);
console.log(`Seed import plan compiled: ${output}`);
console.log(plan.counts);
