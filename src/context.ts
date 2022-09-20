import type { Canvas } from "./canvas.ts";
import ffi, { cstr, readCstr } from "./ffi.ts";
import { Path2D } from "./path.ts";

const {
  sk_canvas_get_context,
  sk_context_destroy,
  sk_context_clear_rect,
  sk_context_set_fill_style,
  sk_context_save,
  sk_context_restore,
  sk_context_fill_rect,
  sk_context_set_stroke_style,
  sk_context_stroke_rect,
  sk_context_begin_path,
  sk_context_close_path,
  sk_context_line_to,
  sk_context_move_to,
  sk_context_fill,
  sk_context_stroke,
  sk_context_get_global_alpha,
  sk_context_get_line_width,
  sk_context_get_miter_limit,
  sk_context_set_global_alpha,
  sk_context_set_line_width,
  sk_context_set_miter_limit,
  sk_context_set_shadow_color,
  sk_context_rect,
  sk_context_clip,
  sk_context_arc,
  sk_context_arc_to,
  sk_context_bezier_curve_to,
  sk_context_ellipse,
  sk_context_quadratic_curve_to,
  sk_context_reset_transform,
  sk_context_rotate,
  sk_context_scale,
  sk_context_set_transform,
  sk_context_transform,
  sk_context_translate,
  sk_context_get_line_cap,
  sk_context_get_line_dash_offset,
  sk_context_get_shadow_blur,
  sk_context_get_shadow_offset_x,
  sk_context_get_shadow_offset_y,
  sk_context_get_text_align,
  sk_context_get_text_baseline,
  sk_context_get_text_direction,
  sk_context_set_font,
  sk_context_set_line_cap,
  sk_context_set_line_dash_offset,
  sk_context_set_shadow_blur,
  sk_context_set_shadow_offset_x,
  sk_context_set_shadow_offset_y,
  sk_context_set_text_align,
  sk_context_set_text_baseline,
  sk_context_set_text_direction,
} = ffi;

const CONTEXT_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_context_destroy(ptr);
});

export type FillRule = "nonzero" | "evenodd";

enum CLineCap {
  butt = 0,
  round = 1,
  square = 2,
}

enum CLineJoin {
  miter = 0,
  round = 1,
  bevel = 2,
}

enum CTextAlign {
  left = 0,
  right = 1,
  center = 2,
}

enum CTextDirection {
  ltr = 0,
  rtl = 1,
}

enum CTextBaseline {
  top = 0,
  middle = 1,
  bottom = 2,
}

export type TextAlign = keyof typeof CTextAlign;
export type TextDirection = keyof typeof CTextDirection;
export type TextBaseline = keyof typeof CTextBaseline;
export type LineCap = keyof typeof CLineCap;
export type LineJoin = keyof typeof CLineJoin;

export class Context {
  #canvas: Canvas;
  #ptr: Deno.PointerValue;

  #fillStyle = "black";
  #strokeStyle = "black";
  #shadowColor = "black";
  #font = "10px sans-serif";

  get _unsafePointer() {
    return this.#ptr;
  }

  get canvas() {
    return this.#canvas;
  }

  constructor(canvas: Canvas) {
    this.#canvas = canvas;
    this.#ptr = sk_canvas_get_context(canvas._unsafePointer);
    if (this.#ptr === 0) {
      throw new Error("Failed to create context");
    }
    CONTEXT_FINALIZER.register(this, this.#ptr);
  }

  isContextLost() {
    return false;
  }

  get fillStyle() {
    return this.#fillStyle;
  }

  set fillStyle(value: string) {
    if (sk_context_set_fill_style(this.#ptr, cstr(value))) {
      this.#fillStyle = value;
    }
  }

  get strokeStyle() {
    return this.#strokeStyle;
  }

  set strokeStyle(value: string) {
    if (sk_context_set_stroke_style(this.#ptr, cstr(value))) {
      this.#strokeStyle = value;
    }
  }

  get lineWidth() {
    return sk_context_get_line_width(this.#ptr);
  }

  set lineWidth(value: number) {
    sk_context_set_line_width(this.#ptr, value);
  }

  get miterLimit() {
    return sk_context_get_miter_limit(this.#ptr);
  }

  set miterLimit(value: number) {
    sk_context_set_miter_limit(this.#ptr, value);
  }

  get globalAlpha() {
    return sk_context_get_global_alpha(this.#ptr);
  }

  set globalAlpha(value: number) {
    sk_context_set_global_alpha(this.#ptr, value);
  }

  get shadowColor() {
    return this.#shadowColor;
  }

  set shadowColor(value: string) {
    if (sk_context_set_shadow_color(this.#ptr, cstr(value))) {
      this.#shadowColor = value;
    }
  }

  get lineCap() {
    return CLineCap[sk_context_get_line_cap(this.#ptr)] as LineCap;
  }

  set lineCap(value: LineCap) {
    sk_context_set_line_cap(this.#ptr, CLineCap[value]);
  }

  // get lineJoin() {
  //   return CLineJoin[sk_context_get_line_join(this.#ptr)] as LineJoin;
  // }

  // set lineJoin(value: LineJoin) {
  //   sk_context_set_line_join(this.#ptr, CLineJoin[value]);
  // }

  get lineDashOffset() {
    return sk_context_get_line_dash_offset(this.#ptr);
  }

  set lineDashOffset(value: number) {
    sk_context_set_line_dash_offset(this.#ptr, value);
  }

  get shadowBlur() {
    return sk_context_get_shadow_blur(this.#ptr);
  }

  set shadowBlur(value: number) {
    sk_context_set_shadow_blur(this.#ptr, value);
  }

  get shadowOffsetX() {
    return sk_context_get_shadow_offset_x(this.#ptr);
  }

  set shadowOffsetX(value: number) {
    sk_context_set_shadow_offset_x(this.#ptr, value);
  }

  get shadowOffsetY() {
    return sk_context_get_shadow_offset_y(this.#ptr);
  }

  set shadowOffsetY(value: number) {
    sk_context_set_shadow_offset_y(this.#ptr, value);
  }

  get textAlign() {
    return CTextAlign[sk_context_get_text_align(this.#ptr)] as TextAlign;
  }

  set textAlign(value: TextAlign) {
    sk_context_set_text_align(this.#ptr, CTextAlign[value]);
  }

  get textBaseline() {
    return CTextBaseline[
      sk_context_get_text_baseline(this.#ptr)
    ] as TextBaseline;
  }

  set textBaseline(value: TextBaseline) {
    sk_context_set_text_baseline(this.#ptr, CTextBaseline[value]);
  }

  get textDirection() {
    return CTextDirection[
      sk_context_get_text_direction(this.#ptr)
    ] as TextDirection;
  }

  set textDirection(value: TextDirection) {
    sk_context_set_text_direction(this.#ptr, CTextDirection[value]);
  }

  set font(value: string) {
    throw new Error("unimplemented");
  }

  get font() {
    return this.#font;
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

  strokeRect(x: number, y: number, width: number, height: number) {
    sk_context_stroke_rect(this.#ptr, x, y, width, height);
  }

  beginPath() {
    sk_context_begin_path(this.#ptr);
  }

  closePath() {
    sk_context_close_path(this.#ptr);
  }

  moveTo(x: number, y: number) {
    sk_context_move_to(this.#ptr, x, y);
  }

  lineTo(x: number, y: number) {
    sk_context_line_to(this.#ptr, x, y);
  }

  rect(x: number, y: number, width: number, height: number) {
    sk_context_rect(this.#ptr, x, y, width, height);
  }

  arcTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
  ) {
    sk_context_arc_to(this.#ptr, x1, y1, x2, y2, radius);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise: boolean,
  ) {
    sk_context_arc(
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
    sk_context_ellipse(
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
    sk_context_bezier_curve_to(this.#ptr, cp1x, cp1y, cp2x, cp2y, x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    sk_context_quadratic_curve_to(this.#ptr, cpx, cpy, x, y);
  }

  fill(): void;
  fill(path: Path2D): void;
  fill(rule: FillRule): void;
  fill(path: Path2D, rule: FillRule): void;
  fill(path?: Path2D | FillRule, rule?: FillRule) {
    const pathptr =
      typeof path === "object" && path !== null && path instanceof Path2D
        ? path._unsafePointer
        : 0;
    const irule = (typeof path === "string" ? path : rule) ?? "nonzero";
    sk_context_fill(this.#ptr, pathptr, irule === "evenodd" ? 1 : 0);
  }

  stroke(path?: Path2D) {
    sk_context_stroke(this.#ptr, path ? path._unsafePointer : 0);
  }

  clip(): void;
  clip(path: Path2D): void;
  clip(fillRule: FillRule): void;
  clip(path: Path2D, fillRule: FillRule): void;
  clip(
    path?: Path2D | FillRule,
    fillRule?: FillRule,
  ) {
    const pathptr = typeof path === "object" && path !== null
      ? path._unsafePointer
      : 0;
    const fillRuleStr = typeof path === "string" ? path : fillRule;
    const ifillRule = fillRuleStr === "evenodd" ? 1 : 0;
    sk_context_clip(this.#ptr, pathptr, ifillRule);
  }

  translate(x: number, y: number) {
    sk_context_translate(this.#ptr, x, y);
  }

  transform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) {
    sk_context_transform(this.#ptr, a, b, c, d, e, f);
  }

  rotate(angle: number) {
    sk_context_rotate(this.#ptr, angle);
  }

  scale(x: number, y: number) {
    sk_context_scale(this.#ptr, x, y);
  }

  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) {
    sk_context_set_transform(this.#ptr, a, b, c, d, e, f);
  }

  resetTransform() {
    sk_context_reset_transform(this.#ptr);
  }

  fillText(text: string, x: number, y: number, maxWidth?: number) {
    throw new Error("unimplemented");
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number) {
    throw new Error("unimplemented");
  }

  measureText(text: string) {
    throw new Error("unimplemented");
  }
}
