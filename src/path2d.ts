import { FillRule } from "./context2d.ts";
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
  sk_path_is_point_in_path,
  sk_path_is_point_in_stroke,
  sk_path_to_svg,
  sk_free_string,
  sk_path_as_winding,
  sk_path_op,
  sk_path_simplify,
  sk_path_add_path_buf,
  sk_path_add_path_ptr,
} = ffi;

const PATH_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_path_destroy(ptr);
});

export type RoundRectRadii =
  | number
  | [all_radii: number]
  | [tl_br: number, tr_bl: number]
  | [
    tl: number,
    tr_bl: number,
    br: number,
  ]
  | [tl: number, tr: number, br: number, bl: number];

export function roundRectRadiiArg(
  v: RoundRectRadii,
): [number, number, number, number] {
  if (typeof v === "number") {
    return [v, v, v, v];
  } else if (v.length === 1) {
    return [v[0], v[0], v[0], v[0]];
  } else if (v.length === 2) {
    return [v[0], v[1], v[0], v[1]];
  } else if (v.length === 3) {
    return [v[0], v[1], v[2], v[1]];
  } else {
    return [v[0], v[1], v[2], v[3]];
  }
}

const OUT_PTR = new BigUint64Array(1);
const OUT_SIZE = new Uint32Array(1);
const OUT_PTR_U8 = new Uint8Array(OUT_PTR.buffer);
const OUT_SIZE_U8 = new Uint8Array(OUT_SIZE.buffer);
const TRANSFORM = new Float32Array(6);
const TU8 = new Uint8Array(TRANSFORM.buffer);

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
    r: RoundRectRadii,
  ) {
    sk_path_round_rect(this.#ptr, x, y, width, height, ...roundRectRadiiArg(r));
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

  isPointInPath(x: number, y: number, fillRule?: FillRule) {
    return sk_path_is_point_in_path(
      this.#ptr,
      x,
      y,
      fillRule === "evenodd" ? 1 : 0,
    ) === 1;
  }

  isPointInStroke(x: number, y: number, lineWidth: number) {
    return sk_path_is_point_in_stroke(
      this.#ptr,
      x,
      y,
      lineWidth,
    ) === 1;
  }

  toSVGString() {
    const skstr = sk_path_to_svg(this.#ptr, OUT_PTR_U8, OUT_SIZE_U8);
    const buffer = Deno.UnsafePointerView.getArrayBuffer(
      OUT_PTR[0],
      OUT_SIZE[0],
    );
    const str = new TextDecoder().decode(buffer);
    sk_free_string(skstr);
    return str;
  }

  simplify() {
    return sk_path_simplify(this.#ptr) === 1;
  }

  asWinding() {
    return sk_path_as_winding(this.#ptr) === 1;
  }

  difference(path: Path2D) {
    return sk_path_op(this.#ptr, path._unsafePointer, 0);
  }

  intersect(path: Path2D) {
    return sk_path_op(this.#ptr, path._unsafePointer, 1);
  }

  reverseDifference(path: Path2D) {
    return sk_path_op(this.#ptr, path._unsafePointer, 4);
  }

  union(path: Path2D) {
    return sk_path_op(this.#ptr, path._unsafePointer, 2);
  }

  xor(path: Path2D) {
    return sk_path_op(this.#ptr, path._unsafePointer, 3);
  }

  addPath(path: Path2D, transform?: DOMMatrix) {
    if (transform) {
      TRANSFORM.set([
        transform.a,
        transform.b,
        transform.e,
        transform.c,
        transform.d,
        transform.f,
      ]);
      sk_path_add_path_buf(this.#ptr, path._unsafePointer, TU8);
    } else {
      sk_path_add_path_ptr(this.#ptr, path._unsafePointer, 0);
    }
  }
}
