import type { Canvas } from "./canvas.ts";
import ffi, { cstr, readCstr } from "./ffi.ts";
import { Path2D } from "./path.ts";

const {
  sk_create_context,
  sk_context_destroy,
  sk_context_clear_rect,
  sk_context_get_fill_style,
  sk_context_set_fill_style,
  sk_context_save,
  sk_context_restore,
  sk_context_fill_rect,
  sk_context_get_stroke_style,
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
  sk_context_get_shadow_color,
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
} = ffi;

const CONTEXT_FINALIZER = new FinalizationRegistry((ptr: Deno.PointerValue) => {
  sk_context_destroy(ptr);
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
    return readCstr(sk_context_get_fill_style(this.#ptr));
  }

  set fillStyle(value: string) {
    sk_context_set_fill_style(this.#ptr, cstr(value));
  }

  get strokeStyle() {
    return readCstr(sk_context_get_stroke_style(this.#ptr));
  }

  set strokeStyle(value: string) {
    sk_context_set_stroke_style(this.#ptr, cstr(value));
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
    return readCstr(sk_context_get_shadow_color(this.#ptr));
  }

  set shadowColor(value: string) {
    sk_context_set_shadow_color(this.#ptr, cstr(value));
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

  fill() {
    sk_context_fill(this.#ptr);
  }

  stroke() {
    sk_context_stroke(this.#ptr);
  }

  clip(): void;
  clip(path: Path2D): void;
  clip(fillRule: "nonzero" | "evenodd"): void;
  clip(path: Path2D, fillRule: "nonzero" | "evenodd"): void;
  clip(
    path?: Path2D | "nonzero" | "evenodd",
    fillRule?: "nonzero" | "evenodd",
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
}
