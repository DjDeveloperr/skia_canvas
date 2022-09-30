import { bench, run } from "mitata";
import { createRequire } from "module";
import { draw } from "./draw.mjs";

const require = createRequire(import.meta.url);
const { createCanvas } = require("@napi-rs/canvas");
const { Canvas: SkiaCanvas } = require("skia-canvas");
const { createCanvas: createNodeCanvas } = require("canvas");

bench("node @napi-rs/canvas", () => {
  const canvas = createCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.toBuffer("image/png");
});

bench("node canvas", () => {
  const canvas = createNodeCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.toBuffer("image/png");
});

bench("node skia-canvas", () => {
  const canvas = new SkiaCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.toBufferSync("image/png");
});

await run();
