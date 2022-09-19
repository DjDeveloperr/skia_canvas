import { Canvas } from "./mod.ts";

Deno.bench("noop", () => {});

Deno.bench("canvas", () => {
  const canvas = new Canvas(100, 100);
});

const canvas = new Canvas(100, 100);
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, 100, 100);
canvas.save("test.png");
