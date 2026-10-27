const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1920;

const PAPER = "#efe7d8";
const INK = "#494138";
const GOLD = "#b99b61";
const GOLD_SOFT = "rgba(185, 155, 97, 0.48)";

const SERIF = '"Cormorant Garamond", "Times New Roman", serif';
const CJK_SERIF = '"Noto Serif SC", "Songti SC", "STSong", serif';

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForCardFonts() {
  await document.fonts.ready;
  await Promise.allSettled([
    document.fonts.load(`500 48px ${SERIF}`, "A NIGHT TO REMEMBER"),
    document.fonts.load(`500 104px ${SERIF}`, "ANNA & ALEX"),
    document.fonts.load(`400 46px ${SERIF}`, "November 1st, 2026"),
    document.fonts.load(`400 42px ${CJK_SERIF}`, "谢谢你成为那天的安娜"),
  ]);
  await waitForNextPaint();
}

function drawTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  tracking: number,
) {
  const characters = Array.from(text);
  const widths = characters.map((character) => context.measureText(character).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + tracking * Math.max(characters.length - 1, 0);
  let x = centerX - totalWidth / 2;

  context.textAlign = "left";
  characters.forEach((character, index) => {
    context.fillText(character, x, y);
    x += widths[index] + tracking;
  });
  context.textAlign = "center";
}

function drawFourPointStar(context: CanvasRenderingContext2D, x: number, y: number, radius: number, alpha = 1) {
  context.save();
  context.translate(x, y);
  context.globalAlpha = alpha;
  context.fillStyle = GOLD;
  context.beginPath();
  context.moveTo(0, -radius);
  context.bezierCurveTo(radius * 0.12, -radius * 0.24, radius * 0.24, -radius * 0.12, radius, 0);
  context.bezierCurveTo(radius * 0.24, radius * 0.12, radius * 0.12, radius * 0.24, 0, radius);
  context.bezierCurveTo(-radius * 0.12, radius * 0.24, -radius * 0.24, radius * 0.12, -radius, 0);
  context.bezierCurveTo(-radius * 0.24, -radius * 0.12, -radius * 0.12, -radius * 0.24, 0, -radius);
  context.closePath();
  context.fill();
  context.restore();
}

function drawOrnament(context: CanvasRenderingContext2D, y: number) {
  context.save();
  context.strokeStyle = GOLD_SOFT;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(394, y);
  context.lineTo(500, y);
  context.moveTo(580, y);
  context.lineTo(686, y);
  context.stroke();
  drawFourPointStar(context, EXPORT_WIDTH / 2, y, 12);
  context.restore();
}

function drawPaper(context: CanvasRenderingContext2D) {
  context.fillStyle = PAPER;
  context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  // A deterministic, very light paper grain keeps the exported card close to the DOM card.
  context.fillStyle = "rgba(95, 75, 48, 0.045)";
  for (let y = 7; y < EXPORT_HEIGHT; y += 13) {
    for (let x = 5; x < EXPORT_WIDTH; x += 17) {
      if ((x * 13 + y * 17) % 37 < 11) context.fillRect(x, y, 1.5, 1.5);
    }
  }
}

function drawBorders(context: CanvasRenderingContext2D) {
  context.save();
  context.strokeStyle = GOLD;
  context.lineWidth = 3;
  context.strokeRect(36.5, 36.5, EXPORT_WIDTH - 73, EXPORT_HEIGHT - 73);

  context.strokeStyle = "rgba(185, 155, 97, 0.68)";
  context.lineWidth = 2;
  context.strokeRect(61, 61, EXPORT_WIDTH - 122, EXPORT_HEIGHT - 122);
  context.strokeStyle = "rgba(185, 155, 97, 0.38)";
  context.strokeRect(70, 70, EXPORT_WIDTH - 140, EXPORT_HEIGHT - 140);
  context.restore();
}

function drawCenteredLines(
  context: CanvasRenderingContext2D,
  lines: readonly string[],
  startY: number,
  lineHeight: number,
) {
  lines.forEach((line, index) => context.fillText(line, EXPORT_WIDTH / 2, startY + lineHeight * index));
}

/**
 * Draws a static, animation-free keepsake card directly to Canvas.
 * It intentionally does not screenshot the animated DOM, so browser SVG/foreignObject,
 * pseudo-element, transform, filter and opacity differences cannot blank the export.
 */
export async function createMemoryCardPng(): Promise<Blob> {
  await waitForCardFonts();

  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable in this browser.");

  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.imageSmoothingEnabled = true;

  drawPaper(context);
  drawBorders(context);

  drawFourPointStar(context, 420, 174, 13, 0.92);
  drawFourPointStar(context, 540, 174, 8, 0.6);
  drawFourPointStar(context, 660, 174, 13, 0.92);

  context.fillStyle = INK;
  context.font = `500 48px ${SERIF}`;
  drawTrackedText(context, "A NIGHT TO REMEMBER", EXPORT_WIDTH / 2, 278, 9);

  context.font = `500 104px ${SERIF}`;
  drawTrackedText(context, "ANNA & ALEX", EXPORT_WIDTH / 2, 430, 7);
  drawOrnament(context, 505);

  context.font = `400 47px ${SERIF}`;
  drawTrackedText(context, "November 1st, 2026", EXPORT_WIDTH / 2, 604, 2.5);
  context.font = `400 42px ${SERIF}`;
  drawTrackedText(context, "Los Angeles, California", EXPORT_WIDTH / 2, 664, 2);

  context.fillStyle = INK;
  context.font = `400 42px ${CJK_SERIF}`;
  drawCenteredLines(context, [
    "故事里的艾利克斯，",
    "没能留住所有的星星。",
    "",
    "但故事外的我们，",
    "留下了这个夜晚。",
  ], 842, 66);

  context.font = `italic 48px ${SERIF}`;
  drawCenteredLines(context, [
    "The story may end,",
    "but this night will remain.",
  ], 1246, 66);

  context.font = `400 37px ${CJK_SERIF}`;
  drawCenteredLines(context, [
    "谢谢你，成为那天的安娜。",
    "也谢谢那个夜晚，",
    "让我有机会成为艾利克斯。",
  ], 1512, 66);

  drawFourPointStar(context, EXPORT_WIDTH / 2, 1773, 9, 0.56);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The browser could not encode the keepsake as PNG."));
    }, "image/png");
  });
}

export const memoryCardExportSize = { width: EXPORT_WIDTH, height: EXPORT_HEIGHT } as const;
