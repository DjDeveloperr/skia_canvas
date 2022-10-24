import { createCanvas, Image, Path2D } from "./mod.ts";

const canvas = createCanvas(300, 300);
const ctx = canvas.getContext("2d");

ctx.filter = "brightness(70%) contrast(160%)";

const img = new Image("./testdata/skia_logo.png");
const pattern = ctx.createPattern(img, "repeat");

// ctx.setLineDash([1, 2]);

ctx.shadowBlur = 20;
ctx.shadowColor = "black";

const gradient = ctx.createConicGradient(0, 150, 150);

gradient.addColorStop(0, "red");
gradient.addColorStop(0.25, "orange");
gradient.addColorStop(0.5, "yellow");
gradient.addColorStop(0.75, "green");
gradient.addColorStop(1, "blue");

// ctx.fillStyle = gradient;

ctx.fillStyle = pattern ?? "white";
ctx.fillRect(0, 0, 300, 300);

ctx.fillStyle = "black";

// Set line width
ctx.lineWidth = 10;

// Wall
ctx.strokeRect(75, 140, 150, 110);

// Door
ctx.beginPath();
ctx.roundRect(130, 190, 40, 60, 8);
ctx.closePath();
ctx.fill();

// Roof
ctx.beginPath();
ctx.moveTo(50, 140);
ctx.lineTo(150, 60);
ctx.lineTo(250, 140);
ctx.closePath();
ctx.stroke();

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
ctx.font = "40px sans-serif";
ctx.fillText("hello, skia text", 10, 10);

const path = new Path2D(
  "M8 50H92C96.4183 50 100 53.5817 100 58V142C100 146.418 96.4183 150 92 150H8C3.58172 150 0 146.418 0 142V58C0 53.5817 3.58172 50 8 50Z",
);
ctx.strokeStyle = gradient;
ctx.save();
ctx.translate(10, 10);
ctx.stroke(path);
ctx.restore();

const data = ctx.getImageData(0, 0, 300, 300);
ctx.putImageData(
  data,
  canvas.width - 100,
  canvas.height - 100,
  20,
  20,
  50,
  50,
);

canvas.save("./testdata/test.png");
console.log("done");
