import ffi from "./ffi.ts";

const {
  sk_create_canvas,
  sk_destroy_canvas,
} = ffi;

const CANVAS_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_destroy_canvas(ptr);
});

export class Canvas {
  #ptr: Deno.PointerValue;

  constructor(width: number, height: number) {
    this.#ptr = sk_create_canvas(width, height);
    if (this.#ptr === 0) {
      throw new Error("Failed to create canvas");
    }
    CANVAS_FINALIZER.register(this, this.#ptr);
  }
}
