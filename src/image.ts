import ffi, { cstr } from "./ffi.ts";

const {
  sk_image_destroy,
  sk_image_from_encoded,
  sk_image_from_file,
  sk_image_height,
  sk_image_width,
} = ffi;

const SK_IMAGE_FINALIZER = new FinalizationRegistry(
  (image: Deno.PointerValue) => {
    sk_image_destroy(image);
  },
);

export class Image {
  #ptr: Deno.PointerValue;

  get _unsafePointer() {
    return this.#ptr;
  }

  constructor(data: Uint8Array | string) {
    this.#ptr = data instanceof Uint8Array
      ? sk_image_from_encoded(data, data.byteLength)
      : sk_image_from_file(cstr(data));
    if (this.#ptr === 0) {
      throw new Error("Failed to load image");
    }
    SK_IMAGE_FINALIZER.register(this, this.#ptr);
  }

  static async load(path: string | URL) {
    const data = path instanceof URL || path.startsWith("http")
      ? await fetch(path).then((e) => e.arrayBuffer()).then((e) =>
        new Uint8Array(e)
      )
      : await Deno.readFile(path);
    return new Image(data);
  }

  /**
   * Load an image from a local file synchronously.
   */
  static loadSync(path: string) {
    const data = Deno.readFileSync(path);
    return new Image(data);
  }

  get width() {
    return sk_image_width(this.#ptr);
  }

  get height() {
    return sk_image_height(this.#ptr);
  }

  [Symbol.for("Deno.customInspect")]() {
    return `Image { width: ${this.width}, height: ${this.height} }`;
  }
}

export type ColorSpace = "srgb" | "rec2020" | "display-p3";

export interface ImageDataSettings {
  colorSpace?: ColorSpace;
}

export class ImageData {
  #width: number;
  #height: number;
  #data: Uint8ClampedArray;
  #colorSpace: ColorSpace;

  constructor(width: number, height: number, settings?: ImageDataSettings);
  constructor(
    dataArray: Uint8ClampedArray | Uint8Array,
    width: number,
    height?: number,
    settings?: ImageDataSettings,
  );
  constructor(
    width: number | Uint8ClampedArray | Uint8Array,
    height: number | ImageDataSettings,
    settings?: ImageDataSettings | number,
    settings2?: ImageDataSettings,
  ) {
    if (typeof width === "number") {
      this.#width = width;
      this.#height = height as number;
      this.#data = new Uint8ClampedArray(width * (height as number) * 4);
      this.#colorSpace = (settings as ImageDataSettings)?.colorSpace ?? "srgb";
    } else {
      this.#data = new Uint8ClampedArray(width.buffer);
      this.#width = height as number;
      this.#height = settings ? settings as number : this.#data.length / 4;
      this.#colorSpace = settings2?.colorSpace ?? "srgb";
    }
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get data() {
    return this.#data;
  }

  get colorSpace() {
    return this.#colorSpace;
  }
}
