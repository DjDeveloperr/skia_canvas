import ffi, { cstr } from "./ffi.ts";

const {
  sk_path_create,
  sk_path_close,
  sk_path_destroy,
  sk_path_line_to,
  sk_path_move_to,
  sk_path_rect,
  sk_path_create_copy,
  sk_path_from_svg_string,
  sk_path_arc,
  sk_path_arc_to,
  sk_path_begin,
  sk_path_bezier_curve_to,
  sk_path_ellipse,
  sk_path_quadratic_curve_to,
  sk_path_round_rect,
} = ffi;

const PATH_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_path_destroy(ptr);
});

export class Path2D {
  #ptr: Deno.PointerValue;

  get _unsafePointer() {
    return this.#ptr;
  }

  constructor();
  constructor(path: Path2D);
  constructor(svg: string);
  constructor(path?: Path2D | string) {
    this.#ptr = typeof path === "string"
      ? sk_path_from_svg_string(cstr(path))
      : typeof path === "object" && path !== null && path instanceof Path2D
      ? sk_path_create_copy(path._unsafePointer)
      : sk_path_create();
    if (this.#ptr === 0) {
      throw new Error("Failed to create path");
    }
    PATH_FINALIZER.register(this, this.#ptr);
  }

  beginPath() {
    sk_path_begin(this.#ptr);
  }

  lineTo(x: number, y: number) {
    sk_path_line_to(this.#ptr, x, y);
  }

  moveTo(x: number, y: number) {
    sk_path_move_to(this.#ptr, x, y);
  }

  rect(x: number, y: number, width: number, height: number) {
    sk_path_rect(this.#ptr, x, y, width, height);
  }

  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
  ) {
    sk_path_round_rect(this.#ptr, x, y, width, height, r);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    sk_path_arc_to(this.#ptr, x1, y1, x2, y2, radius);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise: boolean,
  ) {
    sk_path_arc(
      this.#ptr,
      x,
      y,
      radius,
      startAngle,
      endAngle,
      anticlockwise ? 1 : 0,
    );
  }

  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    anticlockwise: boolean,
  ) {
    sk_path_ellipse(
      this.#ptr,
      x,
      y,
      radiusX,
      radiusY,
      rotation,
      startAngle,
      endAngle,
      anticlockwise ? 1 : 0,
    );
  }

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ) {
    sk_path_bezier_curve_to(this.#ptr, cp1x, cp1y, cp2x, cp2y, x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    sk_path_quadratic_curve_to(this.#ptr, cpx, cpy, x, y);
  }

  closePath() {
    sk_path_close(this.#ptr);
  }
}
