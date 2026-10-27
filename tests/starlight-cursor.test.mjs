import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentPath = new URL("../components/effects/StarlightCursor.tsx", import.meta.url);
const stylesPath = new URL("../app/globals.css", import.meta.url);

test("cursor scaling stays on the visual child and cannot scale its translated position", async () => {
  const [component, styles] = await Promise.all([
    readFile(componentPath, "utf8"),
    readFile(stylesPath, "utf8"),
  ]);

  assert.match(component, /className="star-cursor-visual"/);
  assert.doesNotMatch(styles, /\.star-cursor\.is-(?:interactive|bursting)\s*{[^}]*\bscale\s*:/s);
  assert.match(styles, /\.star-cursor\.is-interactive \.star-cursor-visual\s*{\s*scale:\s*1\.17/);
  assert.match(styles, /\.star-cursor\.is-bursting \.star-cursor-visual\s*{\s*scale:\s*1\.5/);
});
