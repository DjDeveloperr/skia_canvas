import { Context } from "./context.ts";
import ffi, { cstr } from "./ffi.ts";

const {
  sk_create_canvas,
  sk_destroy_canvas,
  sk_canvas_save,
} = ffi;

const CANVAS_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_destroy_canvas(ptr);
});

export class Canvas {
  #ptr: Deno.PointerValue;

  get _unsafePointer() {
    return this.#ptr;
  }

  constructor(width: number, height: number) {
    this.#ptr = sk_create_canvas(width, height);
    if (this.#ptr === 0) {
      throw new Error("Failed to create canvas");
    }
    CANVAS_FINALIZER.register(this, this.#ptr);
  }

  save(path: string) {
    return sk_canvas_save(this.#ptr, cstr(path));
  }

  getContext(type: "2d"): Context;
  getContext(type: string): Context | null {
    switch (type) {
      case "2d":
        return new Context(this);
      default:
        return null;
    }
  }
}
