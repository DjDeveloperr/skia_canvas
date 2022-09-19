import type { Canvas } from "./canvas.ts";
import ffi, { cstr, readCstr } from "./ffi.ts";

const {
  sk_create_context,
  sk_destroy_context,
  sk_context_clear_rect,
  sk_context_get_fill_style,
  sk_context_set_fill_style,
  sk_context_save,
  sk_context_restore,
  sk_context_fill_rect,
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

  get fillStyle() {
    const ptr = sk_context_get_fill_style(this.#ptr);
    return readCstr(ptr);
  }

  set fillStyle(value: string) {
    sk_context_set_fill_style(this.#ptr, cstr(value));
  }

  save() {
    sk_context_save(this.#ptr);
  }

  restore() {
    sk_context_restore(this.#ptr);
  }

  clearRect(x: number, y: number, width: number, height: number) {
    sk_context_clear_rect(this.#ptr, x, y, width, height);
  }

  fillRect(x: number, y: number, width: number, height: number) {
    sk_context_fill_rect(this.#ptr, x, y, width, height);
  }
}
