# Skia Canvas

[![Tags](https://img.shields.io/github/release/DjDeveloperr/skia_canvas)](https://github.com/DjDeveloperr/skia_canvas/releases)
[![Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/skia_canvas@0.1.0/mod.ts)
[![Checks](https://github.com/DjDeveloperr/skia_canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/DjDeveloperr/skia_canvas/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/DjDeveloperr/skia_canvas)](https://github.com/DjDeveloperr/skia_canvas/blob/master/LICENSE)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/DjDeveloperr)

Fast JavaScript Canvas using Skia

## Example

```ts
import { createCanvas } from "https://deno.land/x/skia_canvas@0.1.0/mod.ts";

const canvas = createCanvas(300, 300);
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

ctx.save("./image.png");
```

## Usage

Since this library depends on the unstable FFI API, you must pass `--allow-env`,
`--allow-ffi` and `--unstable` flags. Without it, the module will fail to find
and open native library.

```sh
deno run --allow-ffi --allow-env --unstable <file>
# or just
deno run -A --unstable <file>
```

## License

[Apache-2.0](./LICENSE) licensed.

Copyright 2022 © DjDeveloperr
