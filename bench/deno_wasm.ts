import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";

Deno.bench("deno_canvas wasm", () => {
  const canvas = createCanvas(1024, 768);

  const ctx = canvas.getContext("2d")!;

  ctx.lineWidth = 10;
  ctx.strokeStyle = "#03a9f4";
  ctx.fillStyle = "#03a9f4";

  // Wall
  ctx.strokeRect(75, 140, 150, 110);

  // Door
  ctx.fillRect(130, 190, 40, 60);

  // Roof
  ctx.beginPath();
  ctx.moveTo(50, 140);
  ctx.lineTo(150, 60);
  ctx.lineTo(250, 140);
  ctx.closePath();
  ctx.stroke();

  canvas.toBuffer("image/png");
});
