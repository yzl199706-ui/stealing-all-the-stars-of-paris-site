import sharp from "sharp";

const assets = ["opening", "encounter", "treasures", "seasons", "burning", "paris", "return"];

await Promise.all(
  assets.map((name) =>
    sharp(`public/images/${name}-editorial.png`)
      .webp({ quality: 86, effort: 5 })
      .toFile(`public/images/${name}-editorial.webp`),
  ),
);
