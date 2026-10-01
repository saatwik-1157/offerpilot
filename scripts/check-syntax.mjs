/* Syntax-checks every JavaScript file in the repo with `node --check`.
   There is no build step or test suite; this is the CI-able sanity check. */
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const DIRS = ["apps/web/js", "apps/api/functions", "apps/api/server", "api", "scripts"];
let failed = 0, count = 0;
for (const dir of DIRS) {
  for (const f of readdirSync(dir)) {
    if (!/\.(m?js)$/.test(f)) continue;
    const file = path.join(dir, f);
    count++;
    try { execFileSync(process.execPath, ["--check", file], { stdio: "pipe" }); }
    catch (e) { failed++; console.error(`FAIL ${file}\n${e.stderr}`); }
  }
}
console.log(`${count - failed}/${count} files passed node --check`);
process.exit(failed ? 1 : 0);
