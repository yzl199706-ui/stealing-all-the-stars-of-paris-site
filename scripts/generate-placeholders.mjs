import fs from "node:fs/promises";
import sharp from "sharp";

const source = await fs.readFile("public/images/placeholder.svg");
const names = ["opening", "chapter-1", "chapter-2", "chapter-3-spring", "chapter-3-summer", "chapter-3-autumn", "chapter-3-winter", "chapter-4", "chapter-5", "chapter-6", "chapter-7", "ending"];
await Promise.all(names.map(name => sharp(source, { density: 180 }).resize(1080, 1920).webp({ quality: 76 }).toFile(`public/images/${name}.webp`)));
