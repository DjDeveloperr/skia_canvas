# Skia Canvas

[![Tags](https://img.shields.io/github/release/DjDeveloperr/skia_canvas)](https://github.com/DjDeveloperr/skia_canvas/releases)
[![Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/skia_canvas@0.5.1/mod.ts)
[![Checks](https://github.com/DjDeveloperr/skia_canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/DjDeveloperr/skia_canvas/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/DjDeveloperr/skia_canvas)](https://github.com/DjDeveloperr/skia_canvas/blob/master/LICENSE)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/DjDeveloperr)

Fast HTML Canvas API implementation for Deno using Skia.

## Example

```ts
import { createCanvas } from "https://deno.land/x/skia_canvas@0.5.1/mod.ts";

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

canvas.save("image.png");
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

## API

Check the
[API reference here](https://doc.deno.land/https/deno.land/x/skia_canvas@0.5.1/mod.ts).

Since this module implements the Canvas Web API, you can also refer to the
[MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D).

### Non-standard APIs

For non-standard APIs, see to the API reference mentioned above.

- `Canvas#save` - save canvas render as file
- `Canvas#encode` - encode render into in-memory buffer
- `Image` - provides utility to load image files for drawing on canvas
- `Fonts` - provides utility to manage fonts used by Skia
- `PdfDocument` - create PDF documents using 2D Canvas API
- `SvgCanvas` - like `Canvas` but creates an SVG as output instead
- Several additional methods in `Path2D` object such as `toSVGString`,
  `simplify`, `difference`, `xor`, etc.

## Benchmarks

![Benchmark Results](./bench/results.png)

Source: [bench/main.js](./bench/main.js)

## Building

First you need to
[setup depot_tools](https://www.chromium.org/developers/how-tos/install-depot-tools/).

Then, clone the repository with submodules.

And run the following commands:

```sh
deno task build-skia
deno task build
```

By default, the module will download and cache the prebuilt binaries for your
platform. However this is not intended behavior when developing locally. To use
locally built binaries, set `DENO_SKIA_LOCAL` environment variable to `1`. Or
you can also set `DENO_SKIA_PATH` to a complete path to dynamic library built
from the `native` directory.

## License

[Apache-2.0](./LICENSE) licensed.

Copyright 2022-present © DjDeveloperr
