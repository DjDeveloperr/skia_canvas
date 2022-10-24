import { CanvasRenderingContext2D } from "./context2d.ts";
import ffi, { cstr, getBuffer } from "./ffi.ts";
import { ColorSpace } from "./image.ts";

const {
  sk_canvas_create,
  sk_canvas_destroy,
  sk_canvas_save,
  sk_canvas_read_pixels,
  sk_canvas_encode_image,
  sk_data_free,
} = ffi;

const CANVAS_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_canvas_destroy(ptr);
});

enum CFormat {
  png = 0,
  jpeg = 1,
  webp = 2,
}

export type ImageFormat = keyof typeof CFormat;

const OUT_SIZE = new Uint32Array(1);
const OUT_SIZE_PTR = new Uint8Array(OUT_SIZE.buffer);
const OUT_DATA = new BigUint64Array(1);
const OUT_DATA_PTR = new Uint8Array(OUT_DATA.buffer);

const SK_DATA_FINALIZER = new FinalizationRegistry(
  (ptr: Deno.PointerValue) => {
    sk_data_free(ptr);
  },
);

/**
 * Canvas is an offscreen surface that can be drawn to.
 *
 * Internally it uses Skia's `SkSurface` and raster backend.
 *
 * API is mostly compatible with the Web's `OffscreenCanvas` API,
 * however we also have some non-standard methods such as `save`.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 */
export class Canvas {
  #ptr: Deno.PointerValue;
  #width: number;
  #height: number;
  #pixels: Uint8Array;

  get _unsafePointer() {
    return this.#ptr;
  }

  /** Zero-copy pixels buffer that gets drawn into */
  get pixels() {
    return this.#pixels;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  constructor(width: number, height: number) {
    this.#pixels = new Uint8Array(width * height * 4);
    this.#ptr = sk_canvas_create(
      width,
      height,
      this.#pixels,
    );
    if (this.#ptr === 0) {
      throw new Error("Failed to create canvas");
    }
    CANVAS_FINALIZER.register(this, this.#ptr);
    this.#width = width;
    this.#height = height;
  }

  /**
   * Save the canvas image to a file encoded in specified format
   * and quality.
   *
   * Quality is a factor between 0 and 100, where 100 is the best quality.
   * It represents different factors for different formats.
   */
  save(path: string, format: ImageFormat = "png", quality = 100) {
    if (!sk_canvas_save(this.#ptr, cstr(path), CFormat[format], quality)) {
      throw new Error("Failed to save canvas");
    }
  }

  /**
   * Encode the canvas image into a buffer in specified format
   * and quality.
   */
  encode(format: ImageFormat = "png", quality = 100) {
    const bufptr = sk_canvas_encode_image(
      this.#ptr,
      CFormat[format],
      quality,
      OUT_SIZE_PTR,
      OUT_DATA_PTR,
    );

    if (bufptr === 0) {
      throw new Error("Failed to encode canvas");
    }

    const size = OUT_SIZE[0];
    const ptr = OUT_DATA[0];
    const buffer = new Uint8Array(getBuffer(bufptr, size));
    SK_DATA_FINALIZER.register(buffer, ptr);
    return buffer;
  }

  /**
   * Read pixels from the canvas into a buffer.
   */
  readPixels(
    x: number = 0,
    y: number = 0,
    width?: number,
    height?: number,
    into?: Uint8Array,
    colorSpace: ColorSpace = "srgb",
  ) {
    width = width ?? this.#width;
    height = height ?? this.#height;
    const pixels = into ?? new Uint8Array(width * height * 4);
    sk_canvas_read_pixels(
      this.#ptr,
      x,
      y,
      width,
      height,
      pixels,
      colorSpace === "srgb" ? 0 : 1,
    );
    return pixels;
  }

  getContext(type: "2d"): CanvasRenderingContext2D;
  getContext(type: string): CanvasRenderingContext2D | null {
    switch (type) {
      case "2d":
        return new CanvasRenderingContext2D(this);
      default:
        return null;
    }
  }
}

/**
 * Creates a new canvas with the given dimensions.
 */
export function createCanvas(width: number, height: number) {
  return new Canvas(width, height);
}
