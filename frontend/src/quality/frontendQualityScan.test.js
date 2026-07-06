import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const srcRoot = path.resolve("src");
const allowedConsoleFiles = new Set([
  path.normalize("src/components/common/AppErrorBoundary.jsx"),
]);
const allowedNativeDialogFiles = new Set([
  path.normalize("src/utils/confirmations.js"),
]);
const forbiddenTextPatterns = [
  /ï¿½/,
  /Ã/,
  /Â/,
  /\bis not defined\b/i,
  /Ex:/,
];
const forbiddenBrowserDialogs = [
  /window\.alert\s*\(/,
  /window\.prompt\s*\(/,
  /window\.confirm\s*\(/,
  /\balert\s*\(/,
  /\bprompt\s*\(/,
  /\bconfirm\s*\(/,
];

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    return fullPath;
  }));
  return files.flat();
}

function isSourceFile(file) {
  return /\.(jsx?|css)$/.test(file) && !/\.test\.js$/.test(file);
}

test("frontend source has no mojibake, broken runtime error text or unstandardized examples", async () => {
  const files = (await listFiles(srcRoot)).filter(isSourceFile);
  const violations = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    for (const pattern of forbiddenTextPatterns) {
      if (pattern.test(content)) {
        violations.push(`${path.relative(".", file)} contem padrao proibido ${pattern}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("frontend does not use unexpected console calls", async () => {
  const files = (await listFiles(srcRoot)).filter((file) => /\.(jsx?|js)$/.test(file) && !/\.test\.js$/.test(file));
  const violations = [];

  for (const file of files) {
    const relative = path.normalize(path.relative(".", file));
    const content = await readFile(file, "utf8");
    if (/console\./.test(content) && !allowedConsoleFiles.has(relative)) {
      violations.push(relative);
    }
  }

  assert.deepEqual(violations, []);
});

test("frontend avoids native dialogs outside confirmation utility", async () => {
  const files = (await listFiles(srcRoot)).filter((file) => /\.(jsx?|js)$/.test(file) && !/\.test\.js$/.test(file));
  const violations = [];

  for (const file of files) {
    const relative = path.normalize(path.relative(".", file));
    if (allowedNativeDialogFiles.has(relative)) continue;
    const content = await readFile(file, "utf8");
    for (const pattern of forbiddenBrowserDialogs) {
      if (pattern.test(content)) {
        violations.push(`${path.relative(".", file)} usa dialogo nativo ${pattern}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});
