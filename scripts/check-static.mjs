import fs from "node:fs";
import { spawnSync } from "node:child_process";

const html = fs.readFileSync("index.html", "utf8");
const errors = [];
if (!/^<!doctype html>/i.test(html.trimStart())) errors.push("index.html is missing an HTML5 doctype.");
if (!/<meta\s+name=["']viewport["']/i.test(html)) errors.push("index.html is missing a responsive viewport meta tag.");
if (!/<title>[^<]+<\/title>/i.test(html)) errors.push("index.html is missing a page title.");

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
let checked = 0;
for (let i = 0; i < scripts.length; i++) {
  const attrs = scripts[i][1] || "";
  const source = scripts[i][2] || "";
  if (/\bsrc\s*=/i.test(attrs) || !source.trim()) continue;
  if (/application\/(?:ld\+)?json/i.test(attrs)) continue;
  const isModule = /\btype\s*=\s*["']module["']/i.test(attrs);
  const result = spawnSync(process.execPath, isModule ? ["--check", "--input-type=module"] : ["--check"], {
    input: source,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    errors.push(`Inline script ${i + 1} has a JavaScript syntax error:\n${result.stderr || result.stdout}`);
  } else {
    checked++;
  }
}

if (/SUPABASE_SERVICE_ROLE_KEY\s*=/i.test(html) || /service_role\s*[:=]\s*["'][^"']+["']/i.test(html)) {
  errors.push("A possible Supabase service-role secret assignment was found in browser code.");
}
if (/\beval\s*\(|\bnew\s+Function\s*\(/.test(html)) {
  errors.push("Dynamic code execution (eval / new Function) was found in index.html.");
}

if (errors.length) {
  console.error(errors.join("\n\n"));
  process.exit(1);
}
console.log(`Static checks passed: HTML basics verified; ${checked} inline JavaScript block(s) syntax-checked; no obvious service-role assignment or dynamic-code execution found.`);
