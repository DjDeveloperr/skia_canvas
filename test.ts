import { Canvas } from "./mod.ts";

const canvas = new Canvas(100, 100);

const ctx = canvas.getContext("2d");
ctx.fillRect(0, 0, 100, 100);
ctx.fillStyle = "red";
ctx.fillRect(10, 10, 80, 80);
canvas.save("test.png");
