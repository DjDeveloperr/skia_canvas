import { Context } from "./context.ts";
import ffi, { cstr } from "./ffi.ts";

const {
  sk_canvas_create,
  sk_canvas_destroy,
  sk_canvas_save,
} = ffi;

const CANVAS_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_canvas_destroy(ptr);
});

export class Canvas {
  #ptr: Deno.PointerValue;
  #width: number;
  #height: number;

  get _unsafePointer() {
    return this.#ptr;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  constructor(width: number, height: number) {
    this.#ptr = sk_canvas_create(width, height);
    if (this.#ptr === 0) {
      throw new Error("Failed to create canvas");
    }
    CANVAS_FINALIZER.register(this, this.#ptr);
    this.#width = width;
    this.#height = height;
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
