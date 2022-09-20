import { Canvas, Path2D } from "./mod.ts";

const canvas = new Canvas(200, 200);

const ctx = canvas.getContext("2d");
const path = new Path2D();
path.rect(0, 0, 100, 100);
ctx.save();
ctx.clip(path);
ctx.restore();
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.beginPath();
ctx.moveTo(20, 20);
ctx.lineTo(20, 180);
ctx.lineTo(180, 180);
ctx.closePath();
ctx.stroke();
canvas.save("test.png");
