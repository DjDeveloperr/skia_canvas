import { Canvas } from "./canvas.ts";
import { CanvasRenderingContext2D } from "./context2d.ts";
import ffi, { cstr } from "./ffi.ts";

const {
  sk_window_create,
  sk_window_destroy,
  sk_window_draw_begin,
  sk_window_draw_end,
  sk_window_get_position,
  sk_window_get_size,
  sk_window_hide,
  sk_window_set_position,
  sk_window_set_size,
  sk_window_set_title,
  sk_window_show,
} = ffi;

const OUT_INT32_1 = new Int32Array(1);
const OUT_INT32_2 = new Int32Array(1);
const OUT_INT32_1_PTR = new Uint8Array(OUT_INT32_1.buffer);
const OUT_INT32_2_PTR = new Uint8Array(OUT_INT32_2.buffer);

export class SkWindow {
  #ptr: Deno.PointerValue;
  #canvas: Canvas;
  #context: CanvasRenderingContext2D;
  #title = "";

  constructor(width: number, height: number, title: string, visible = true) {
    this.#ptr = sk_window_create(width, height, cstr(title), visible);
    if (this.#ptr === 0) {
      throw new Error("Failed to create window");
    }
    this.#title = title;
    this.#canvas = new Canvas(width, height, true);
    this.#context = this.#canvas.getContext("2d");
  }

  get canvas() {
    return this.#canvas;
  }

  get context() {
    return this.#context;
  }

  get title() {
    return this.#title;
  }

  set title(title: string) {
    sk_window_set_title(this.#ptr, cstr(title));
    this.#title = title;
  }

  show() {
    sk_window_show(this.#ptr);
  }

  hide() {
    sk_window_hide(this.#ptr);
  }

  destroy() {
    sk_window_destroy(this.#ptr);
    this.#ptr = 0;
  }

  setSize(width: number, height: number) {
    sk_window_set_size(this.#ptr, width, height);
  }

  getSize() {
    sk_window_get_size(this.#ptr, OUT_INT32_1_PTR, OUT_INT32_2_PTR);
    return [OUT_INT32_1[0], OUT_INT32_2[0]] as const;
  }

  getPosition() {
    sk_window_get_position(this.#ptr, OUT_INT32_1_PTR, OUT_INT32_2_PTR);
    return [OUT_INT32_1[0], OUT_INT32_2[0]] as const;
  }

  setPosition(x: number, y: number) {
    sk_window_set_position(this.#ptr, x, y);
  }

  async draw(fn: (ctx: CanvasRenderingContext2D) => any) {
    sk_window_draw_begin(this.#ptr);
    await fn(this.#context);
    sk_window_draw_end(this.#ptr, this.#canvas._unsafePointer);
  }
}
