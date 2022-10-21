import ffi, { cstr } from "./ffi.ts";

const {
  sk_gradient_add_color_stop,
  sk_gradient_destroy,
} = ffi;

const GRADIENT_FINALIZER = new FinalizationRegistry(
  (ptr: Deno.PointerValue) => {
    sk_gradient_destroy(ptr);
  },
);

export class CanvasGradient {
  #ptr: Deno.PointerValue;

  get _unsafePointer() {
    return this.#ptr;
  }

  constructor(ptr: Deno.PointerValue) {
    this.#ptr = ptr;
    GRADIENT_FINALIZER.register(this, ptr);
  }

  addColorStop(offset: number, color: string) {
    sk_gradient_add_color_stop(this.#ptr, offset, cstr(color));
  }
}
