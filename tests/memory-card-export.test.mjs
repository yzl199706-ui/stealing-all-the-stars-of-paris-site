import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const exporterPath = new URL("../components/keepsake/createMemoryCardPng.ts", import.meta.url);
const pagePath = new URL("../app/page.tsx", import.meta.url);

test("memory card export is a static 1080 x 1920 PNG with all required copy", async () => {
  const [exporter, page] = await Promise.all([
    readFile(exporterPath, "utf8"),
    readFile(pagePath, "utf8"),
  ]);

  assert.match(exporter, /EXPORT_WIDTH = 1080/);
  assert.match(exporter, /EXPORT_HEIGHT = 1920/);
  assert.match(exporter, /document\.fonts\.ready/);
  assert.match(exporter, /canvas\.toBlob/);

  for (const text of [
    "A NIGHT TO REMEMBER",
    "ANNA & ALEX",
    "November 1st, 2026",
    "Los Angeles, California",
    "故事里的艾利克斯，",
    "The story may end,",
    "谢谢你，成为那天的安娜。",
    "让我有机会成为艾利克斯。",
  ]) {
    assert.ok(exporter.includes(text), `missing exported copy: ${text}`);
  }

  assert.ok(page.includes("createMemoryCardPng"));
  assert.doesNotMatch(page, /html-to-image|toPng\(/);
});
