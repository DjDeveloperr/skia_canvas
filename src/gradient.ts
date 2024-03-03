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

const _ptr = Symbol("[[ptr]]");

export class CanvasGradient {
  [_ptr]: Deno.PointerValue;

  get _unsafePointer(): Deno.PointerValue {
    return this[_ptr];
  }

  constructor(ptr: Deno.PointerValue) {
    this[_ptr] = ptr;
    GRADIENT_FINALIZER.register(this, ptr);
  }

  addColorStop(offset: number, color: string) {
    sk_gradient_add_color_stop(this[_ptr], offset, cstr(color));
  }
}
