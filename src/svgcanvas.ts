import { CanvasRenderingContext2D } from "./context2d.ts";
import ffi, { cstr, getBuffer } from "./ffi.ts";

const {
  sk_svg_destroy,
  sk_svg_get_buffer,
  sk_svg_new,
  sk_svg_get_context,
  sk_svg_write_file,
  sk_data_free,
} = ffi;

const SVG_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_svg_destroy(ptr);
});

const SK_DATA_FINALIZER = new FinalizationRegistry(
  (ptr: Deno.PointerValue) => {
    sk_data_free(ptr);
  },
);

const OUT_SIZE = new Uint32Array(1);
const OUT_SIZE_PTR = new Uint8Array(OUT_SIZE.buffer);
const OUT_DATA = new BigUint64Array(1);
const OUT_DATA_PTR = new Uint8Array(OUT_DATA.buffer);

export class SvgRenderingContext2D extends CanvasRenderingContext2D {
  // @ts-expect-error
  declare readonly canvas: SvgCanvas;

  constructor(canvas: SvgCanvas, ptr: Deno.PointerValue) {
    super(canvas as any, ptr);
  }
}

export interface SvgCanvasOptions {
  convertTextsToPaths?: boolean;
  noPrettyXml?: boolean;
  relativePathEncoding?: boolean;
}

/**
 * A canvas that can be used to render SVG.
 */
export class SvgCanvas {
  #ptr: Deno.PointerValue;

  constructor(
    public readonly width: number,
    public readonly height: number,
    options: SvgCanvasOptions = {},
  ) {
    this.#ptr = sk_svg_new(
      width,
      height,
      0 | (options.convertTextsToPaths ? 1 : 0) |
        (options.noPrettyXml ? 2 : 0) | (options.relativePathEncoding ? 4 : 0),
    );
    if (this.#ptr === 0) {
      throw new Error("Failed to create SVG Canvas");
    }
    SVG_FINALIZER.register(this, this.#ptr);
  }

  /** Obtain 2D context for drawing on SVG */
  getContext() {
    const ptr = sk_svg_get_context(this.#ptr);
    if (ptr === 0) {
      throw new Error("Failed to get SVG context");
    }
    return new SvgRenderingContext2D(this, ptr);
  }

  /** Save SVG on file system */
  save(path: string) {
    if (!sk_svg_write_file(this.#ptr, cstr(path))) {
      throw new Error("Failed to save SVG");
    }
  }

  /** Encode and return buffer containing SVG data */
  encode() {
    const skdata = sk_svg_get_buffer(this.#ptr, OUT_DATA_PTR, OUT_SIZE_PTR);
    if (!skdata) {
      throw new Error("Failed to encode SVG");
    }
    const size = OUT_SIZE[0];
    const ptr = OUT_DATA[0];
    const buffer = new Uint8Array(getBuffer(ptr, size));
    SK_DATA_FINALIZER.register(buffer, skdata);
    return buffer;
  }

  /** Convert to SVG string */
  toString() {
    const skdata = sk_svg_get_buffer(this.#ptr, OUT_DATA_PTR, OUT_SIZE_PTR);
    if (!skdata) {
      throw new Error("Failed to encode SVG");
    }
    const size = OUT_SIZE[0];
    const ptr = OUT_DATA[0];
    const buffer = new Uint8Array(getBuffer(ptr, size));
    const text = new TextDecoder().decode(buffer);
    sk_data_free(skdata);
    return text;
  }
}
