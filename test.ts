import { Canvas } from "./mod.ts";

Deno.bench("noop", () => {});

Deno.bench("canvas", () => {
  const canvas = new Canvas(100, 100);
});

const canvas = new Canvas(100, 100);
const ctx = canvas.getContext("2d");
canvas.save("test.png");
