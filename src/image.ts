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

  static async load(path: string) {
    const data = await Deno.readFile(path);
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
