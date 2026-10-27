export const memory = {
  title: "如果麦田还记得你",
  englishTitle: "If the Wheat Field Remembers You",
  names: "ANNA & ALEX",
  date: "November 1st, 2026",
  location: "Los Angeles, California",
  game: "《洗劫巴黎所有的星星》",
} as const;

const assetPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

export const imagePaths = {
  opening: assetPath("/images/opening-editorial.webp"),
  encounter: assetPath("/images/encounter-editorial.webp"),
  treasures: assetPath("/images/treasures-editorial.webp"),
  spring: assetPath("/images/seasons-editorial.webp"),
  summer: assetPath("/images/seasons-editorial.webp"),
  autumn: assetPath("/images/seasons-editorial.webp"),
  winter: assetPath("/images/seasons-editorial.webp"),
  burning: assetPath("/images/burning-editorial.webp"),
  paris: assetPath("/images/paris-editorial.webp"),
  return: assetPath("/images/return-editorial.webp"),
  memory: assetPath("/images/chapter-7.webp"),
  ending: assetPath("/images/opening-editorial.webp"),
} as const;

export const chapters = {
  encounter: {
    number: "第一章 · 初见", english: "The First Encounter", scene: "encounter",
    lines: ["在遇见你之前，", "我以为世界只有这一片麦田。", "春天来过，秋天离开。", "我站在这里，看过无数次日落。", "直到有一天，", "一只与众不同的白色渡鸦，", "停在了我的肩膀上。"],
  },
  treasures: {
    number: "第二章 · 闪闪发光的宝物", english: "Little Treasures", scene: "treasures",
    lines: ["你总喜欢把闪闪发亮的东西带回来。", "有时是一颗玻璃珠，", "有时是一件你觉得珍贵的小玩意。", "你把它们放在我的身边，", "仿佛在告诉我，", "麦田之外，还有一个很大的世界。", "后来我才明白，", "你带回来的从来不只是那些宝物。", "还有你眼中的整个世界。"],
  },
  burning: {
    number: "第四章 · 燃烧的麦田", english: "The Burning Field", scene: "burning",
    lines: ["我曾经以为，", "只要我一直站在这里，", "就能永远看着你飞向天空。", "可是后来，", "那片熟悉的麦田燃起了火。", "我第一次希望，", "自己能够拥有一双脚。", "不是为了逃离这里。", "而是为了能够走向你。"],
  },
  paris: {
    number: "第五章 · 巴黎的星星", english: "Under the Parisian Stars", scene: "paris",
    lines: ["后来，奇迹真的发生了。", "我终于拥有了双脚。", "终于能够走过那些曾经遥不可及的道路。", "终于能够亲手触碰那些你带回来的宝物。", "也终于能够，", "站在你的身边，", "和你一起仰望星星。", "原来成为人类，", "是这样幸福的一件事情。"],
  },
  return: {
    number: "第六章 · 星星的归处", english: "Where the Stars Return", scene: "return",
    lines: ["安娜：", "如果有一天，", "你再一次飞过那片金色的麦田。", "希望你还记得，", "曾经有一个稻草人，", "很高兴认识你。", "他曾经站在那里，", "看过很多次日出与日落。", "可是他最喜欢的，", "始终是你飞回来的那个黄昏。", "—— 艾利克斯"],
  },
} as const;

export const generationPrompts = [
  ["opening.webp", "Vertical French impressionist oil painting, golden wheat field at dawn, a consistent straw-hatted scarecrow in the distance, a white raven gliding through cream clouds, muted wheat gold and sage, no text, leave lower center calm for HTML copy"],
  ["chapter-1.webp", "Vertical dreamy French oil painting, solitary straw-hatted scarecrow in a soft gray-gold wheat field, white raven landing gently on its shoulder, warm sunlight emerging, no text, airy lower third"],
  ["chapter-2.webp", "Vertical impressionist fairytale painting, consistent scarecrow decorated with roses and tulips, three subtle treasures among wheat, white raven nearby, warm muted colors, no text"],
  ["chapter-3-spring.webp", "Vertical French impressionist wheat field in spring, flowers opening around the same straw-hatted scarecrow, white raven, pale green and cream, no text"],
  ["chapter-3-summer.webp", "Vertical French impressionist summer wheat field, same scarecrow and white raven, soft golden sun, quiet cinematic composition, no text"],
  ["chapter-3-autumn.webp", "Vertical French impressionist autumn, ripe wheat around same scarecrow and white raven, muted amber and dusty rose, no text"],
  ["chapter-3-winter.webp", "Vertical French impressionist winter wheat field, same scarecrow and white raven, sparse gentle snow, muted blue cream palette, no text"],
  ["chapter-4.webp", "Vertical painterly fairytale oil painting, wheat field in quiet distant firelight, lone straw-hatted scarecrow and white raven circling overhead, burnt amber and midnight blue, nonviolent, no text"],
  ["chapter-5.webp", "Vertical French impressionist Paris night, Eiffel Tower distant, Seine reflections, Anna and Alex as consistent backlit silhouettes by river, white raven motif, subtle stars, no text"],
  ["chapter-6.webp", "Vertical nocturnal impressionist golden wheat field beneath a midnight-blue star sky, tranquil straw-hatted scarecrow and white raven flying away, no text"],
  ["chapter-7.webp", "Vertical antique cream paper texture, delicate gold border, wheat, white feather and star ornament corners, empty center, no text"],
  ["ending.webp", "Vertical French impressionist keepsake illustration, golden wheat field, straw-hatted scarecrow with a white raven on shoulder, a few stars in cream and midnight sky, no text"],
] as const;
