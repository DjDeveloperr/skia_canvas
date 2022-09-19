import { bench, run } from "mitata";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { createCanvas } = require("@napi-rs/canvas");

bench("noop", () => {});

bench("canvas", () => {
  const canvas = createCanvas(100, 100);
});

await run();
