import ffi from "./ffi.ts";

const {
  sk_create_canvas,
  sk_destroy_canvas,
} = ffi;

export class Canvas {
  #ptr: Deno.PointerValue;

  constructor(width: number, height: number) {
    this.#ptr = sk_create_canvas(width, height);
    if (this.#ptr === 0) {
      throw new Error("Failed to create canvas");
    }
  }

  destroy() {
    sk_destroy_canvas(this.#ptr);
  }
}
