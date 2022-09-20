import { Canvas, Path2D } from "./mod.ts";

const canvas = new Canvas(300, 300);

const ctx = canvas.getContext("2d");

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

canvas.save("test.png");
console.log(canvas.encode("jpeg"));
