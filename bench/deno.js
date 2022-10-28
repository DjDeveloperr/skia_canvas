import { createCanvas, Image } from "../mod.ts";
import {
  createCanvas as createCanvasWasm,
  loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { draw, drawGradient, drawImage } from "./draw.mjs";

Deno.bench("encoding: deno skia_canvas", () => {
  const canvas = createCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.encode("png");
});

Deno.bench("encoding: deno canvaskit-wasm", () => {
  const canvas = createCanvasWasm(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.toBuffer("image/png");
});

Deno.bench("gradient: deno skia_canvas", () => {
  const canvas = createCanvas(1024, 512);
  const ctx = canvas.getContext("2d");
  drawGradient(ctx);
  canvas.encode("png");
});

Deno.bench("gradient: deno canvaskit-wasm", () => {
  const canvas = createCanvasWasm(1024, 512);
  const ctx = canvas.getContext("2d");
  drawGradient(ctx);
  canvas.toBuffer("image/png");
});

Deno.bench("images: deno skia_canvas", () => {
  const canvas = createCanvas(1000, 1400);
  const ctx = canvas.getContext("2d");
  const skiaImage = new Image("./testdata/skia_logo.png");
  const testImage = new Image("./testdata/test.png");
  drawImage(ctx, skiaImage, testImage);
  canvas.encode("png");
});

Deno.bench("images: deno canvaskit-wasm", async () => {
  const canvas = createCanvasWasm(1000, 1400);
  const ctx = canvas.getContext("2d");
  const skiaImage = await loadImage("./testdata/skia_logo.png");
  const testImage = await loadImage("./testdata/test.png");
  drawImage(ctx, skiaImage, testImage);
  canvas.toBuffer("image/png");
});
