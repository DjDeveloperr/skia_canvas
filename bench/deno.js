import { createCanvas } from "../mod.ts";
// import { createCanvas as createCanvasWasm } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { draw } from "./draw.mjs";

Deno.bench("deno skia_canvas", () => {
  const canvas = createCanvas(1024, 768);
  const ctx = canvas.getContext("2d");
  draw(ctx);
  canvas.encode("png", 100);
});

// Deno.bench("deno canvaskit-wasm", () => {
//   const canvas = createCanvasWasm(1024, 768);
//   const ctx = canvas.getContext("2d");
//   draw(ctx);
//   canvas.toBuffer("image/png");
// });
