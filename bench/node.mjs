import { bench, run } from "mitata";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { createCanvas } = require("@napi-rs/canvas");

bench("napi-rs/canvas", () => {
  const canvas = createCanvas(1024, 768);
  const ctx = canvas.getContext("2d");

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

  canvas.async = false;
  canvas.toBuffer("image/png");
});

await run();
