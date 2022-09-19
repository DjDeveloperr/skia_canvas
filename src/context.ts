import type { Canvas } from "./canvas.ts";
import ffi from "./ffi.ts";

const {
  sk_create_context,
  sk_destroy_context,
} = ffi;

const CONTEXT_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_destroy_context(ptr);
});

export class Context {
  #canvas: Canvas;
  #ptr: Deno.PointerValue;

  get _unsafePointer() {
    return this.#ptr;
  }

  get canvas() {
    return this.#canvas;
  }

  constructor(canvas: Canvas) {
    this.#canvas = canvas;
    this.#ptr = sk_create_context(canvas._unsafePointer);
    if (this.#ptr === 0) {
      throw new Error("Failed to create context");
    }
    CONTEXT_FINALIZER.register(this, this.#ptr);
  }
}
