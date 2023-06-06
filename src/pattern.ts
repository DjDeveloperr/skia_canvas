import { DOMMatrix } from "./dommatrix.ts";
import ffi from "./ffi.ts";
import { Image } from "./image.ts";

const {
  sk_pattern_new_image,
  sk_pattern_destroy,
  sk_pattern_set_transform,
} = ffi;

const PATTERN_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_pattern_destroy(ptr);
});

const repeat = {
  repeat: 0,
  ["repeat-x"]: 1,
  ["repeat-y"]: 2,
  ["no-repeat"]: 3,
};

export type CanvasPatternImage = Image;
export type CanvasPatternRepeat = keyof typeof repeat;

const _ptr = Symbol("[[ptr]]");

export class CanvasPattern {
  [_ptr]: Deno.PointerValue;

  get _unsafePointer() {
    return this[_ptr];
  }

  constructor(image: CanvasPatternImage, repetition: CanvasPatternRepeat) {
    if (image._unsafePointer === null) throw new Error("Image not loaded");
    this[_ptr] = sk_pattern_new_image(image._unsafePointer, repeat[repetition]);
    PATTERN_FINALIZER.register(this, this[_ptr]);
  }

  setTransform(transform: DOMMatrix) {
    sk_pattern_set_transform(
      this[_ptr],
      transform.a,
      transform.b,
      transform.c,
      transform.d,
      transform.e,
      transform.f,
    );
  }
}
