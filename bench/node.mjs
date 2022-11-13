import { bench, run } from "mitata";
import { createRequire } from "module";
import { draw, drawGradient, drawImage } from "./draw.mjs";

const require = createRequire(import.meta.url);
const { createCanvas, loadImage: napiLoadImage } = require("@napi-rs/canvas");
const { Canvas: SkiaCanvas, loadImage: skiaLoadImage } = require("skia-canvas");
const { createCanvas: createNodeCanvas, loadImage: nodeLoadImage } = require(
  "canvas",
);

bench("encoding: node @napi-rs/canvas", () => {
  const canvas = createCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.toBuffer("image/png");
});

bench("encoding: node canvas", () => {
  const canvas = createNodeCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.toBuffer("image/png");
});

bench("encoding: node skia-canvas", () => {
  const canvas = new SkiaCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.toBufferSync("image/png");
});

bench("gradient: node @napi-rs/canvas", () => {
  const canvas = createCanvas(1024, 512);
  const ctx = canvas.getContext("2d");
  drawGradient(ctx);
  canvas.toBuffer("image/png");
});

bench("gradient: node canvas", () => {
  const canvas = createNodeCanvas(1024, 512);
  const ctx = canvas.getContext("2d");
  drawGradient(ctx);
  canvas.toBuffer("image/png");
});

bench("gradient: node skia-canvas", () => {
  const canvas = new SkiaCanvas(1024, 512);
  const ctx = canvas.getContext("2d");
  drawGradient(ctx);
  canvas.toBufferSync("image/png");
});

bench("images: node @napi-rs/canvas", async () => {
  const canvas = createCanvas(1000, 1400);
  const ctx = canvas.getContext("2d");
  const skiaImage = await napiLoadImage("./testdata/skia_logo.png");
  const testImage = await napiLoadImage("./testdata/test.png");
  drawImage(ctx, skiaImage, testImage);
  canvas.toBuffer("image/png");
});

bench("images: node canvas", async () => {
  const canvas = createNodeCanvas(1000, 1400);
  const ctx = canvas.getContext("2d");
  const skiaImage = await nodeLoadImage("./testdata/skia_logo.png");
  const testImage = await nodeLoadImage("./testdata/test.png");
  drawImage(ctx, skiaImage, testImage);
  canvas.toBuffer("image/png");
});

bench("images: node skia-canvas", async () => {
  const canvas = new SkiaCanvas(1000, 1400);
  const ctx = canvas.getContext("2d");
  const skiaImage = await skiaLoadImage("./testdata/skia_logo.png");
  const testImage = await skiaLoadImage("./testdata/test.png");
  drawImage(ctx, skiaImage, testImage);
  canvas.toBufferSync("image/png");
});

await run({
  colors: process.env.NO_COLOR !== "1",
});
