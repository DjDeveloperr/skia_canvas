import { Canvas, Image, Path2D } from "./mod.ts";

const canvas = new Canvas(300, 300);

const ctx = canvas.getContext("2d");

ctx.fillStyle = "white";
ctx.fillRect(0, 0, 300, 300);

ctx.fillStyle = "black";

// Set line width
ctx.lineWidth = 10;

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

const img = new Image("./testdata/skia_logo.png");

ctx.drawImage(
  img,
  5,
  5,
  img.width - 10,
  img.height - 10,
  50,
  50,
  img.width,
  img.height,
);

ctx.fillStyle = "skyblue";
ctx.font = "30px DejaVu Sans";
console.log(ctx.measureText("hello"));
ctx.fillText("hello, skia text", 10, 10);

const path = new Path2D(
  "M8 50H92C96.4183 50 100 53.5817 100 58V142C100 146.418 96.4183 150 92 150H8C3.58172 150 0 146.418 0 142V58C0 53.5817 3.58172 50 8 50Z",
);
ctx.strokeStyle = "blue";
ctx.save();
ctx.translate(10, 10);
ctx.stroke(path);
ctx.restore();

canvas.save("./testdata/test.png");
console.log("done");
