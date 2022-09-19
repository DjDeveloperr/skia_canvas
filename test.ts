import { Canvas } from "./mod.ts";

Deno.bench("noop", () => {});

Deno.bench("canvas", () => {
  const canvas = new Canvas(100, 100);
});
