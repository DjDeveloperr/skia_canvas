import { Canvas } from "./canvas.ts";
import { DOMMatrix } from "./dommatrix.ts";
import ffi, { cstr } from "./ffi.ts";
import { FilterType, parseFilterString } from "./filter.ts";
import { CanvasGradient } from "./gradient.ts";
import { Image, ImageData } from "./image.ts";
import { parseFont } from "./parse_font.ts";
import { Path2D, RoundRectRadii, roundRectRadiiArg } from "./path2d.ts";
import {
  CanvasPattern,
  CanvasPatternImage,
  CanvasPatternRepeat,
} from "./pattern.ts";

const {
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
  sk_context_draw_image,
  sk_context_text,
  sk_context_get_line_join,
  sk_context_set_line_join,
  sk_context_set_line_dash,
  sk_context_is_point_in_path,
  sk_context_is_point_in_stroke,
  sk_context_get_global_composite_operation,
  sk_context_set_global_composite_operation,
  sk_context_get_image_smoothing_enabled,
  sk_context_set_image_smoothing_enabled,
  sk_context_round_rect,
  sk_context_get_transform,
  sk_context_get_image_smoothing_quality,
  sk_context_set_image_smoothing_quality,
  sk_context_put_image_data_dirty,
  sk_context_put_image_data,
  sk_gradient_create_conic,
  sk_gradient_create_linear,
  sk_gradient_create_radial,
  sk_context_set_fill_style_gradient,
  sk_context_set_stroke_style_gradient,
  sk_context_set_fill_style_pattern,
  sk_context_set_stroke_style_pattern,
  sk_context_filter_contrast,
  sk_context_filter_invert,
  sk_context_filter_brightness,
  sk_context_filter_blur,
  sk_context_filter_drop_shadow,
  sk_context_filter_grayscale,
  sk_context_filter_hue_rotate,
  sk_context_filter_opacity,
  sk_context_filter_reset,
  sk_context_filter_saturated,
  sk_context_filter_sepia,
  sk_context_get_word_spacing,
  sk_context_get_letter_spacing,
  sk_context_set_word_spacing,
  sk_context_set_letter_spacing,
  sk_context_set_font_stretch,
  sk_context_set_font_variant_caps,
} = ffi;

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
  center = 1,
  right = 2,
  start = 3,
  end = 4,
}

enum CTextDirection {
  inherit = 0,
  ltr = 1,
  rtl = 2,
}

enum CTextBaseline {
  top,
  hanging,
  middle,
  alphabetic,
  ideographic,
  bottom,
}

enum CImageSmoothingQuality {
  low = 1,
  medium = 2,
  high = 3,
}

// deno-fmt-ignore
const CGlobalCompositeOperation = {
  ["source-over"]: 0,
  ["source-in"]: 1,
  ["source-out"]: 2,
  ["source-atop"]: 3,
  ["destination-over"]: 4,
  ["destination-in"]: 5,
  ["destination-out"]: 6,
  ["destination-atop"]: 7,
  ["xor"]: 8,
  ["copy"]: 10, // modulate (TODO: is this right)
  ["screen"]: 11,
  ["overlay"]: 12,
  ["darken"]: 13,
  ["lighten"]: 14,
  ["color-dodge"]: 15,
  ["color-burn"]: 16,
  ["hard-light"]: 17,
  ["soft-light"]: 18,
  ["difference"]: 19,
  ["exclusion"]: 20,
  ["multiply"]: 21,
  ["hue"]:22,
  ["saturation"] : 23,
  ["color"] : 24,
  ["luminosity"] : 25,
} as const;

export type TextAlign = keyof typeof CTextAlign;
export type TextDirection = keyof typeof CTextDirection;
export type TextBaseline = keyof typeof CTextBaseline;
export type LineCap = keyof typeof CLineCap;
export type LineJoin = keyof typeof CLineJoin;
export type CanvasImageSource = Canvas | Image;
export type GlobalCompositeOperation = keyof typeof CGlobalCompositeOperation;
export type ImageSmoothingQuality = keyof typeof CImageSmoothingQuality;

const METRICS = new Float32Array(7);
const METRICS_PTR = Deno.UnsafePointer.of(METRICS);

export type Style = string | CanvasGradient | CanvasPattern;

const CFontStretch = {
  ["ultra-condensed"]: 1,
  ["50%"]: 1,
  ["extra-condensed"]: 2,
  ["62.5%"]: 2,
  ["condensed"]: 3,
  ["75%"]: 3,
  ["semi-condensed"]: 4,
  ["87.5%"]: 4,
  ["normal"]: 5,
  ["100%"]: 5,
  ["semi-expanded"]: 6,
  ["112.5%"]: 6,
  ["expanded"]: 7,
  ["125%"]: 7,
  ["extra-expanded"]: 8,
  ["150%"]: 8,
  ["ultra-expanded"]: 9,
  ["200%"]: 9,
} as const;

const CFontVariantCaps = {
  ["normal"]: 0,
  ["small-caps"]: 1,
} as const;

export type FontStretch = keyof typeof CFontStretch;
export type FontVariantCaps = keyof typeof CFontVariantCaps;

const _canvas = Symbol("[[canvas]]");
const _ptr = Symbol("[[ptr]]");
const _fillStyle = Symbol("[[fillStyle]]");
const _strokeStyle = Symbol("[[strokeStyle]]");
const _shadowColor = Symbol("[[shadowColor]]");
const _font = Symbol("[[font]]");
const _fontStretch = Symbol("[[fontStretch]]");
const _fontVariantCaps = Symbol("[[fontVariantCaps]]");
const _lineDash = Symbol("[[lineDash]]");
const _filter = Symbol("[[filter]]");

/**
 * @link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
export class CanvasRenderingContext2D {
  /// Internal State

  [_canvas]: Canvas;
  [_ptr]: Deno.PointerValue;

  [_fillStyle]: Style = "black";
  [_strokeStyle]: Style = "black";
  [_shadowColor] = "black";
  [_font] = "10px sans-serif";
  [_fontStretch]: FontStretch = "normal";
  [_fontVariantCaps]: FontVariantCaps = "normal";
  [_lineDash]: number[] = [];
  [_filter] = "none";

  /// For FFI interface
  get _unsafePointer() {
    return this[_ptr];
  }

  set _unsafePointer(ptr: Deno.PointerValue) {
    this[_ptr] = ptr;
    this[_fillStyle] = "black";
    this[_strokeStyle] = "black";
    this[_shadowColor] = "black";
    this[_font] = "10px sans-serif";
    this[_fontStretch] = "normal";
    this[_fontVariantCaps] = "normal";
    this[_lineDash] = [];
    this[_filter] = "none";
  }

  constructor(canvas: Canvas, ptr: Deno.PointerValue) {
    this[_canvas] = canvas;
    this[_ptr] = ptr;
    if (this[_ptr] === null) {
      throw new Error("Failed to create context");
    }
  }

  /// Drawing rectangles

  clearRect(x: number, y: number, width: number, height: number) {
    sk_context_clear_rect(this[_ptr], x, y, width, height);
  }

  fillRect(x: number, y: number, width: number, height: number) {
    sk_context_fill_rect(this[_ptr], x, y, width, height);
  }

  strokeRect(x: number, y: number, width: number, height: number) {
    sk_context_stroke_rect(this[_ptr], x, y, width, height);
  }

  /// Drawing text

  fillText(text: string, x: number, y: number, maxWidth?: number) {
    const encoded = new TextEncoder().encode(text);
    if (
      !sk_context_text(
        this[_ptr],
        encoded,
        encoded.byteLength,
        x,
        y,
        maxWidth ?? 100_000,
        1,
        null,
      )
    ) {
      throw new Error("failed to fill text");
    }
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number) {
    const encoded = new TextEncoder().encode(text);
    if (
      !sk_context_text(
        this[_ptr],
        encoded,
        encoded.byteLength,
        x,
        y,
        maxWidth ?? 100_000,
        0,
        null,
      )
    ) {
      throw new Error("failed to stroke text");
    }
  }

  measureText(text: string) {
    if (text.length === 0) {
      return {
        width: 0,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: 0,
        actualBoundingBoxAscent: 0,
        actualBoundingBoxDescent: 0,
        fontBoundingBoxAscent: 0,
        fontBoundingBoxDescent: 0,
        alphabeticBaseline: 0,
        emHeightAscent: 0,
        emHeightDescent: 0,
      };
    }
    const encoded = new TextEncoder().encode(text);
    if (
      !sk_context_text(
        this[_ptr],
        encoded,
        encoded.byteLength,
        0,
        0,
        100_000,
        1,
        METRICS_PTR,
      )
    ) {
      throw new Error("failed to measure text");
    }
    return {
      width: METRICS[4],
      actualBoundingBoxLeft: METRICS[2],
      actualBoundingBoxRight: METRICS[3],
      actualBoundingBoxAscent: METRICS[0],
      actualBoundingBoxDescent: METRICS[1],
      fontBoundingBoxAscent: METRICS[5],
      fontBoundingBoxDescent: METRICS[6],
      alphabeticBaseline: METRICS[5],
      emHeightAscent: METRICS[5],
      emHeightDescent: METRICS[6],
    };
  }

  /// Line styles

  get lineWidth() {
    return sk_context_get_line_width(this[_ptr]);
  }

  set lineWidth(value: number) {
    sk_context_set_line_width(this[_ptr], value);
  }

  get lineCap() {
    return CLineCap[sk_context_get_line_cap(this[_ptr])] as LineCap;
  }

  set lineCap(value: LineCap) {
    sk_context_set_line_cap(this[_ptr], CLineCap[value]);
  }

  get lineJoin() {
    return CLineJoin[sk_context_get_line_join(this[_ptr])] as LineJoin;
  }

  set lineJoin(value: LineJoin) {
    sk_context_set_line_join(this[_ptr], CLineJoin[value]);
  }

  get miterLimit() {
    return sk_context_get_miter_limit(this[_ptr]);
  }

  set miterLimit(value: number) {
    sk_context_set_miter_limit(this[_ptr], value);
  }

  getLineDash() {
    return this[_lineDash];
  }

  setLineDash(value: number[]) {
    this[_lineDash] = value;
    sk_context_set_line_dash(this[_ptr], new Float32Array(value), value.length);
  }

  get lineDashOffset() {
    return sk_context_get_line_dash_offset(this[_ptr]);
  }

  set lineDashOffset(value: number) {
    sk_context_set_line_dash_offset(this[_ptr], Number(value));
  }

  /// Text styles

  set font(value: string) {
    const font = parseFont(value);
    if (font) {
      if (
        sk_context_set_font(
          this[_ptr],
          font.size,
          cstr(font.family),
          font.weight,
          font.style,
          font.variant,
          font.stretch,
        )
      ) {
        this[_font] = value;
      }
    } else {
      throw new Error("Invalid font");
    }
  }

  get font() {
    return this[_font];
  }

  get textAlign() {
    return CTextAlign[sk_context_get_text_align(this[_ptr])] as TextAlign;
  }

  set textAlign(value: TextAlign) {
    sk_context_set_text_align(this[_ptr], CTextAlign[value]);
  }

  get textBaseline() {
    return CTextBaseline[
      sk_context_get_text_baseline(this[_ptr])
    ] as TextBaseline;
  }

  set textBaseline(value: TextBaseline) {
    sk_context_set_text_baseline(this[_ptr], CTextBaseline[value]);
  }

  get direction() {
    return CTextDirection[
      sk_context_get_text_direction(this[_ptr])
    ] as TextDirection;
  }

  set direction(value: TextDirection) {
    sk_context_set_text_direction(this[_ptr], CTextDirection[value]);
  }

  get letterSpacing() {
    return sk_context_get_letter_spacing(this[_ptr]);
  }

  set letterSpacing(value: number) {
    sk_context_set_letter_spacing(this[_ptr], value);
  }

  get wordSpacing() {
    return sk_context_get_word_spacing(this[_ptr]);
  }

  set wordSpacing(value: number) {
    sk_context_set_word_spacing(this[_ptr], value);
  }

  get fontKerning() {
    return "auto";
  }

  set fontKerning(value: "auto") {
    if (value !== "auto") {
      throw new Error("fontKerning only supports 'auto'");
    }
  }

  get fontStretch() {
    return this[_fontStretch];
  }

  set fontStretch(value: FontStretch) {
    const c = CFontStretch[value];
    if (typeof c !== "number") {
      throw new Error("invalid fontStretch");
    }
    this[_fontStretch] = value;
    sk_context_set_font_stretch(this[_ptr], c);
  }

  get fontVariantCaps() {
    return this[_fontVariantCaps];
  }

  set fontVariant(value: FontVariantCaps) {
    const c = CFontVariantCaps[value];
    if (typeof c !== "number") {
      throw new Error("invalid fontVariantCaps");
    }
    this[_fontVariantCaps] = value;
    sk_context_set_font_variant_caps(this[_ptr], c);
  }

  get textRendering() {
    return "auto";
  }

  set textRendering(value: "auto") {
    if (value !== "auto") {
      throw new Error("textRendering only supports 'auto'");
    }
  }

  /// Fill and stroke styles

  get fillStyle() {
    return this[_fillStyle];
  }

  set fillStyle(value: Style) {
    if (typeof value === "string") {
      if (sk_context_set_fill_style(this[_ptr], cstr(value))) {
        this[_fillStyle] = value;
      }
    } else if (
      typeof value === "object" && value !== null &&
      value instanceof CanvasGradient
    ) {
      sk_context_set_fill_style_gradient(this[_ptr], value._unsafePointer);
      this[_fillStyle] = value;
    } else if (
      typeof value === "object" && value !== null &&
      value instanceof CanvasPattern
    ) {
      sk_context_set_fill_style_pattern(this[_ptr], value._unsafePointer);
      this[_fillStyle] = value;
    } else {
      throw new Error("Invalid fill style");
    }
  }

  get strokeStyle() {
    return this[_strokeStyle];
  }

  set strokeStyle(value: Style) {
    if (typeof value === "string") {
      if (sk_context_set_stroke_style(this[_ptr], cstr(value))) {
        this[_strokeStyle] = value;
      }
    } else if (
      typeof value === "object" && value !== null &&
      value instanceof CanvasGradient
    ) {
      sk_context_set_stroke_style_gradient(this[_ptr], value._unsafePointer);
      this[_strokeStyle] = value;
    } else if (
      typeof value === "object" && value !== null &&
      value instanceof CanvasPattern
    ) {
      sk_context_set_stroke_style_pattern(this[_ptr], value._unsafePointer);
      this[_strokeStyle] = value;
    } else {
      throw new Error("Invalid stroke style");
    }
  }

  /// Gradients and patterns

  createConicGradient(
    r: number,
    x: number,
    y: number,
  ) {
    return new CanvasGradient(sk_gradient_create_conic(x, y, r));
  }

  createLinearGradient(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ) {
    return new CanvasGradient(sk_gradient_create_linear(x0, y0, x1, y1));
  }

  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
  ) {
    return new CanvasGradient(
      sk_gradient_create_radial(x0, y0, r0, x1, y1, r1),
    );
  }

  createPattern(
    image: CanvasPatternImage,
    repetition?: CanvasPatternRepeat,
  ): CanvasPattern {
    return new CanvasPattern(image, repetition || "repeat");
  }

  /// Shadows

  get shadowBlur() {
    return sk_context_get_shadow_blur(this[_ptr]);
  }

  set shadowBlur(value: number) {
    sk_context_set_shadow_blur(this[_ptr], value);
  }

  get shadowColor() {
    return this[_shadowColor];
  }

  set shadowColor(value: string) {
    if (sk_context_set_shadow_color(this[_ptr], cstr(value))) {
      this[_shadowColor] = value;
    }
  }

  get shadowOffsetX() {
    return sk_context_get_shadow_offset_x(this[_ptr]);
  }

  set shadowOffsetX(value: number) {
    sk_context_set_shadow_offset_x(this[_ptr], value);
  }

  get shadowOffsetY() {
    return sk_context_get_shadow_offset_y(this[_ptr]);
  }

  set shadowOffsetY(value: number) {
    sk_context_set_shadow_offset_y(this[_ptr], value);
  }

  /// Paths

  beginPath() {
    sk_context_begin_path(this[_ptr]);
  }

  closePath() {
    sk_context_close_path(this[_ptr]);
  }

  moveTo(x: number, y: number) {
    sk_context_move_to(this[_ptr], x, y);
  }

  lineTo(x: number, y: number) {
    sk_context_line_to(this[_ptr], x, y);
  }

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ) {
    sk_context_bezier_curve_to(this[_ptr], cp1x, cp1y, cp2x, cp2y, x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    sk_context_quadratic_curve_to(this[_ptr], cpx, cpy, x, y);
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
      this[_ptr],
      x,
      y,
      radius,
      startAngle,
      endAngle,
      anticlockwise ? 1 : 0,
    );
  }

  arcTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
  ) {
    sk_context_arc_to(this[_ptr], x1, y1, x2, y2, radius);
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
      this[_ptr],
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

  rect(x: number, y: number, width: number, height: number) {
    sk_context_rect(this[_ptr], x, y, width, height);
  }

  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    r: RoundRectRadii,
  ) {
    sk_context_round_rect(
      this[_ptr],
      x,
      y,
      width,
      height,
      ...roundRectRadiiArg(r),
    );
  }

  /// Drawing paths

  fill(): void;
  fill(path: Path2D): void;
  fill(rule: FillRule): void;
  fill(path: Path2D, rule: FillRule): void;
  fill(path?: Path2D | FillRule, rule?: FillRule) {
    const pathptr =
      typeof path === "object" && path !== null && path instanceof Path2D
        ? path._unsafePointer
        : null;
    const irule = (typeof path === "string" ? path : rule) ?? "nonzero";
    sk_context_fill(this[_ptr], pathptr, irule === "evenodd" ? 1 : 0);
  }

  stroke(path?: Path2D) {
    sk_context_stroke(
      this[_ptr],
      path ? path._unsafePointer : null,
    );
  }

  drawFocusIfNeeded() {
    throw new Error("Context.drawFocusIfNeeded() not implemented");
  }

  scrollPathIntoView() {
    throw new Error("Context.scrollPathIntoView() not implemented");
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
      : null;
    const fillRuleStr = typeof path === "string" ? path : fillRule;
    const ifillRule = fillRuleStr === "evenodd" ? 1 : 0;
    sk_context_clip(this[_ptr], pathptr, ifillRule);
  }

  isPointInPath(
    x: number,
    y: number,
    fillRule?: FillRule,
  ): boolean;
  isPointInPath(
    path: Path2D,
    x: number,
    y: number,
    fillRule?: FillRule,
  ): boolean;
  isPointInPath(
    path: Path2D | number,
    x: number,
    y?: number | FillRule,
    fillRule?: FillRule,
  ): boolean {
    const pathptr = typeof path === "object" && path !== null
      ? path._unsafePointer
      : null;
    const ifillRule = (typeof y === "string" ? y : fillRule) === "evenodd"
      ? 1
      : 0;
    return sk_context_is_point_in_path(
      this[_ptr],
      typeof path === "number" ? path : x,
      typeof path === "number" ? x : y as number,
      pathptr,
      ifillRule,
    ) === 1;
  }

  isPointInStroke(
    x: number,
    y: number,
  ): boolean;
  isPointInStroke(
    path: Path2D,
    x: number,
    y: number,
  ): boolean;
  isPointInStroke(
    path: Path2D | number,
    x: number,
    y?: number,
  ): boolean {
    const pathptr = typeof path === "object" && path !== null
      ? path._unsafePointer
      : null;
    return sk_context_is_point_in_stroke(
      this[_ptr],
      typeof path === "number" ? path : x,
      typeof path === "number" ? x : y as number,
      pathptr,
    ) === 1;
  }

  /// Transformations

  getTransform() {
    const f32 = new Float32Array(6);
    sk_context_get_transform(this[_ptr], f32);
    return new DOMMatrix(f32[0], f32[1], f32[2], f32[3], f32[4], f32[5]);
  }

  rotate(angle: number) {
    sk_context_rotate(this[_ptr], angle);
  }

  scale(x: number, y: number) {
    sk_context_scale(this[_ptr], x, y);
  }

  translate(x: number, y: number) {
    sk_context_translate(this[_ptr], x, y);
  }

  transform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) {
    sk_context_transform(this[_ptr], a, b, c, d, e, f);
  }

  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ): void;
  setTransform(matrix: DOMMatrix): void;
  setTransform(
    a: number | DOMMatrix,
    b?: number,
    c?: number,
    d?: number,
    e?: number,
    f?: number,
  ) {
    if (typeof a === "number") {
      sk_context_set_transform(this[_ptr], a, b!, c!, d!, e!, f!);
    } else {
      sk_context_set_transform(this[_ptr], a.a, a.b, a.c, a.d, a.e, a.f);
    }
  }

  resetTransform() {
    sk_context_reset_transform(this[_ptr]);
  }

  /// Compositing

  get globalAlpha() {
    return sk_context_get_global_alpha(this[_ptr]);
  }

  set globalAlpha(value: number) {
    sk_context_set_global_alpha(this[_ptr], value);
  }

  get globalCompositeOperation() {
    const op = sk_context_get_global_composite_operation(this[_ptr]);
    return Object.entries(CGlobalCompositeOperation).find((e) =>
      e[1] === op
    )![0] as GlobalCompositeOperation;
  }

  set globalCompositeOperation(value: GlobalCompositeOperation) {
    sk_context_set_global_composite_operation(
      this[_ptr],
      CGlobalCompositeOperation[value],
    );
  }

  /// Drawing images

  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(
    image: CanvasImageSource,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
  drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
  drawImage(
    image: CanvasImageSource,
    adx: number,
    ady: number,
    adw?: number,
    adh?: number,
    asx?: number,
    asy?: number,
    asw?: number,
    ash?: number,
  ) {
    if (image instanceof Image && image._unsafePointer === null) {
      return;
    }
    const dx = asx ?? adx;
    const dy = asy ?? ady;
    const dw = asw ?? adw ?? image.width;
    const dh = ash ?? adh ?? image.height;
    const sx = asx === undefined ? 0 : adx;
    const sy = asy === undefined ? 0 : ady;
    const sw = asw === undefined ? image.width : adw ?? image.width;
    const sh = ash === undefined ? image.height : adh ?? image.height;
    sk_context_draw_image(
      this[_ptr],
      image instanceof Canvas ? image._unsafePointer : null,
      image instanceof Image ? image._unsafePointer : null,
      dx,
      dy,
      dw,
      dh,
      sx,
      sy,
      sw,
      sh,
    );
  }

  /// Pixel manipulation

  createImageData(sw: number, sh: number): ImageData;
  createImageData(imagedata: ImageData): ImageData;
  createImageData(sw: number | ImageData, sh?: number) {
    if (typeof sw === "number") {
      return new ImageData(sw, sh!);
    } else {
      return new ImageData(sw.width, sw.height);
    }
  }

  getImageData(sx: number, sy: number, sw: number, sh: number) {
    if (!(this[_canvas] instanceof Canvas)) {
      throw new Error("getImageData is only supported on Canvas");
    }
    const data = new Uint8Array(sw * sh * 4);
    this[_canvas].readPixels(sx, sy, sh, sh, data, "srgb");
    return new ImageData(data, sw, sh);
  }

  putImageData(
    imagedata: ImageData,
    dx: number,
    dy: number,
    dirtyX?: number,
    dirtyY?: number,
    dirtyWidth?: number,
    dirtyHeight?: number,
  ) {
    if (dirtyX !== undefined) {
      dirtyX = dirtyX ?? 0;
      dirtyY = dirtyY ?? 0;
      dirtyWidth = dirtyWidth ?? imagedata.width;
      dirtyHeight = dirtyHeight ?? imagedata.height;
      if (dirtyWidth < 0) {
        dirtyX += dirtyWidth;
        dirtyWidth = Math.abs(dirtyWidth);
      }
      if (dirtyHeight < 0) {
        dirtyY += dirtyHeight;
        dirtyHeight = Math.abs(dirtyHeight);
      }
      if (dirtyX < 0) {
        dirtyWidth += dirtyX;
        dirtyX = 0;
      }
      if (dirtyY < 0) {
        dirtyHeight += dirtyY;
        dirtyY = 0;
      }
      if (dirtyWidth <= 0 || dirtyHeight <= 0) {
        return;
      }
      sk_context_put_image_data_dirty(
        this[_ptr],
        imagedata.width,
        imagedata.height,
        new Uint8Array(imagedata.data.buffer),
        imagedata.width * 4,
        imagedata.data.byteLength,
        dx,
        dy,
        dirtyX,
        dirtyY,
        dirtyWidth,
        dirtyHeight,
        imagedata.colorSpace === "srgb" ? 0 : 1,
      );
    } else {
      sk_context_put_image_data(
        this[_ptr],
        imagedata.width,
        imagedata.height,
        new Uint8Array(imagedata.data.buffer),
        imagedata.width * 4,
        dx,
        dy,
      );
    }
  }

  /// Image smoothing

  get imageSmoothingEnabled() {
    return sk_context_get_image_smoothing_enabled(this[_ptr]) === 1;
  }

  set imageSmoothingEnabled(value: boolean) {
    sk_context_set_image_smoothing_enabled(this[_ptr], value ? 1 : 0);
  }

  get imageSmoothingQuality() {
    const quality = sk_context_get_image_smoothing_quality(this[_ptr]);
    return CImageSmoothingQuality[quality] as ImageSmoothingQuality;
  }

  set imageSmoothingQuality(value: ImageSmoothingQuality) {
    sk_context_set_image_smoothing_quality(
      this[_ptr],
      CImageSmoothingQuality[value],
    );
  }

  /// The canvas state

  save() {
    sk_context_save(this[_ptr]);
  }

  restore() {
    sk_context_restore(this[_ptr]);
  }

  get canvas() {
    return this[_canvas];
  }

  getContextAttributes() {
    return {
      alpha: true,
      desynchronized: false,
    };
  }

  reset() {
    throw new Error("TODO: Context.reset()");
  }

  isContextLost() {
    return false;
  }

  /// Filters

  get filter() {
    return this[_filter];
  }

  set filter(value: string) {
    if (value === "none" || value === "") {
      sk_context_filter_reset(this[_ptr]);
      this[_filter] = value;
      return;
    }
    const filters = parseFilterString(value);
    this[_filter] = value;
    for (const filter of filters) {
      switch (filter.type) {
        case FilterType.Blur:
          sk_context_filter_blur(this[_ptr], filter.value);
          break;

        case FilterType.Brightness:
          sk_context_filter_brightness(this[_ptr], filter.value);
          break;

        case FilterType.Contrast:
          sk_context_filter_contrast(this[_ptr], filter.value);
          break;

        case FilterType.DropShadow:
          sk_context_filter_drop_shadow(
            this[_ptr],
            filter.dx,
            filter.dy,
            filter.radius,
            cstr(filter.color),
          );
          break;

        case FilterType.Grayscale:
          sk_context_filter_grayscale(this[_ptr], filter.value);
          break;

        case FilterType.HueRotate:
          sk_context_filter_hue_rotate(this[_ptr], filter.value);
          break;

        case FilterType.Invert:
          sk_context_filter_invert(this[_ptr], filter.value);
          break;

        case FilterType.Opacity:
          sk_context_filter_opacity(this[_ptr], filter.value);
          break;

        case FilterType.Saturate:
          sk_context_filter_saturated(this[_ptr], filter.value);
          break;

        case FilterType.Sepia:
          sk_context_filter_sepia(this[_ptr], filter.value);
          break;
      }
    }
  }
}
