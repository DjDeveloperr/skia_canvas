import { Canvas } from "./canvas.ts";
import ffi, { cstr } from "./ffi.ts";
import { Image } from "./image.ts";
import { parseFont } from "./parse_font.ts";
import { Path2D } from "./path2d.ts";

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

// deno-fmt-ignore
enum CGlobalCompositeOperation {
  ["source-over"] = 0,
  ["source-in"] = 1,
  ["source-out"] = 2,
  ["source-atop"] = 3,
  ["destination-over"] = 4,
  ["destination-in"] = 5,
  ["destination-out"] = 6,
  ["destination-atop"] = 7,
  ["xor"] = 8,
  ["copy"] = 10, // modulate (TODO: is this right)
  ["screen"] = 11,
  ["overlay"] = 12,
  ["darken"] = 13,
  ["lighten"] = 14,
  ["color-dodge"] = 15,
  ["color-burn"] = 16,
  ["hard-light"] = 17,
  ["soft-light"] = 18,
  ["difference"] = 19,
  ["exclusion"] = 20,
  ["multiply"] = 21,
  ["hue"] = 22,
  ["saturation"] = 23,
  ["color"] = 24,
  ["luminosity"] = 25,
}

export type TextAlign = keyof typeof CTextAlign;
export type TextDirection = keyof typeof CTextDirection;
export type TextBaseline = keyof typeof CTextBaseline;
export type LineCap = keyof typeof CLineCap;
export type LineJoin = keyof typeof CLineJoin;
export type CanvasImageSource = Canvas | Image;
export type GlobalCompositeOperation = keyof typeof CGlobalCompositeOperation;

const METRICS = new Float32Array(7);
const METRICS_PTR = Number(Deno.UnsafePointer.of(METRICS));

export class CanvasRenderingContext2D {
  /// Internal State

  #canvas: Canvas;
  #ptr: Deno.PointerValue;

  #fillStyle = "black";
  #strokeStyle = "black";
  #shadowColor = "black";
  #font = "";
  #lineDash: number[] = [];

  /// For FFI interface
  get _unsafePointer() {
    return this.#ptr;
  }

  constructor(canvas: Canvas) {
    this.#canvas = canvas;
    this.#ptr = sk_canvas_get_context(canvas._unsafePointer);
    if (this.#ptr === 0) {
      throw new Error("Failed to create context");
    }
    CONTEXT_FINALIZER.register(this, this.#ptr);
  }

  /// Drawing rectangles

  clearRect(x: number, y: number, width: number, height: number) {
    sk_context_clear_rect(this.#ptr, x, y, width, height);
  }

  fillRect(x: number, y: number, width: number, height: number) {
    sk_context_fill_rect(this.#ptr, x, y, width, height);
  }

  strokeRect(x: number, y: number, width: number, height: number) {
    sk_context_stroke_rect(this.#ptr, x, y, width, height);
  }

  /// Drawing text

  fillText(text: string, x: number, y: number, maxWidth?: number) {
    if (
      !sk_context_text(
        this.#ptr,
        cstr(text),
        text.length,
        x,
        y,
        maxWidth ?? 100_000,
        1,
        0,
      )
    ) {
      throw new Error("failed to fill text");
    }
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number) {
    if (
      !sk_context_text(
        this.#ptr,
        cstr(text),
        text.length,
        x,
        y,
        maxWidth ?? 100_000,
        0,
        0,
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
      };
    }

    if (
      !sk_context_text(
        this.#ptr,
        cstr(text),
        text.length,
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
    };
  }

  /// Line styles

  get lineWidth() {
    return sk_context_get_line_width(this.#ptr);
  }

  set lineWidth(value: number) {
    sk_context_set_line_width(this.#ptr, value);
  }

  get lineCap() {
    return CLineCap[sk_context_get_line_cap(this.#ptr)] as LineCap;
  }

  set lineCap(value: LineCap) {
    sk_context_set_line_cap(this.#ptr, CLineCap[value]);
  }

  get lineJoin() {
    return CLineJoin[sk_context_get_line_join(this.#ptr)] as LineJoin;
  }

  set lineJoin(value: LineJoin) {
    sk_context_set_line_join(this.#ptr, CLineJoin[value]);
  }

  get miterLimit() {
    return sk_context_get_miter_limit(this.#ptr);
  }

  set miterLimit(value: number) {
    sk_context_set_miter_limit(this.#ptr, value);
  }

  get lineDash() {
    return this.#lineDash;
  }

  set lineDash(value: number[]) {
    this.#lineDash = value;
    sk_context_set_line_dash(this.#ptr, new Float32Array(value), value.length);
  }

  get lineDashOffset() {
    return sk_context_get_line_dash_offset(this.#ptr);
  }

  set lineDashOffset(value: number) {
    sk_context_set_line_dash_offset(this.#ptr, value);
  }

  /// Text styles

  set font(value: string) {
    const font = parseFont(value);
    if (font) {
      if (
        sk_context_set_font(
          this.#ptr,
          font.size,
          cstr(font.family),
          font.weight,
          font.style,
          font.variant,
          font.stretch,
        )
      ) {
        this.#font = value;
      }
    } else {
      throw new Error("Invalid font");
    }
  }

  get font() {
    return this.#font;
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

  get direction() {
    return CTextDirection[
      sk_context_get_text_direction(this.#ptr)
    ] as TextDirection;
  }

  set direction(value: TextDirection) {
    sk_context_set_text_direction(this.#ptr, CTextDirection[value]);
  }

  // TODO: Context.letterSpacing
  // TODO: Context.fontKerning
  // TODO: Context.fontStretch
  // TODO: Context.fontVariantCaps
  // TODO: Context.textRendering
  // TODO: Context.wordSpacing

  /// Fill and stroke styles

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

  /// Gradients and patterns

  // TODO: Context.createConicGradient()
  // TODO: Context.createLinearGradient()
  // TODO: Context.createRadialGradient()
  // TODO: Context.createPattern()

  /// Shadows

  get shadowBlur() {
    return sk_context_get_shadow_blur(this.#ptr);
  }

  set shadowBlur(value: number) {
    sk_context_set_shadow_blur(this.#ptr, value);
  }

  get shadowColor() {
    return this.#shadowColor;
  }

  set shadowColor(value: string) {
    if (sk_context_set_shadow_color(this.#ptr, cstr(value))) {
      this.#shadowColor = value;
    }
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

  /// Paths

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

  arcTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
  ) {
    sk_context_arc_to(this.#ptr, x1, y1, x2, y2, radius);
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

  rect(x: number, y: number, width: number, height: number) {
    sk_context_rect(this.#ptr, x, y, width, height);
  }

  // TODO: Add support for specifying multiple radii for different corners
  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
  ) {
    sk_context_round_rect(this.#ptr, x, y, width, height, r);
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
        : 0;
    const irule = (typeof path === "string" ? path : rule) ?? "nonzero";
    sk_context_fill(this.#ptr, pathptr, irule === "evenodd" ? 1 : 0);
  }

  stroke(path?: Path2D) {
    sk_context_stroke(this.#ptr, path ? path._unsafePointer : 0);
  }

  // TODO: Context.drawFocusIfNeeded() (should we support it?)
  // TODO: Context.scrollPathIntoView() (should we support it?)

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
      : 0;
    const ifillRule = (typeof y === "string" ? y : fillRule) === "evenodd"
      ? 1
      : 0;
    return sk_context_is_point_in_path(
      this.#ptr,
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
      : 0;
    return sk_context_is_point_in_stroke(
      this.#ptr,
      typeof path === "number" ? path : x,
      typeof path === "number" ? x : y as number,
      pathptr,
    ) === 1;
  }

  /// Transformations

  // TODO: Context.getTransform()

  rotate(angle: number) {
    sk_context_rotate(this.#ptr, angle);
  }

  scale(x: number, y: number) {
    sk_context_scale(this.#ptr, x, y);
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

  /// Compositing

  get globalAlpha() {
    return sk_context_get_global_alpha(this.#ptr);
  }

  set globalAlpha(value: number) {
    sk_context_set_global_alpha(this.#ptr, value);
  }

  get globalCompositeOperation() {
    return CGlobalCompositeOperation[
      sk_context_get_global_composite_operation(this.#ptr)
    ] as GlobalCompositeOperation;
  }

  set globalCompositeOperation(value: GlobalCompositeOperation) {
    sk_context_set_global_composite_operation(
      this.#ptr,
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
    const dx = asx ?? adx;
    const dy = asy ?? ady;
    const dw = asw ?? adw ?? image.width;
    const dh = ash ?? adh ?? image.height;
    const sx = asx === undefined ? 0 : adx;
    const sy = asy === undefined ? 0 : ady;
    const sw = asw === undefined ? image.width : adw ?? image.width;
    const sh = ash === undefined ? image.height : adh ?? image.height;
    sk_context_draw_image(
      this.#ptr,
      image instanceof Canvas ? image._unsafePointer : 0,
      image instanceof Image ? image._unsafePointer : 0,
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

  // TODO: Context.createImageData()
  // TODO: Context.getImageData()
  // TODO: Context.putImageData()

  /// Image smoothing

  get imageSmoothingEnabled() {
    return sk_context_get_image_smoothing_enabled(this.#ptr) === 1;
  }

  set imageSmoothingEnabled(value: boolean) {
    sk_context_set_image_smoothing_enabled(this.#ptr, value ? 1 : 0);
  }

  /// The canvas state

  save() {
    sk_context_save(this.#ptr);
  }

  restore() {
    sk_context_restore(this.#ptr);
  }

  get canvas() {
    return this.#canvas;
  }

  getContextAttributes() {
    return {
      alpha: true,
      desynchronized: false,
    };
  }

  // TODO: Context.reset()

  isContextLost() {
    return false;
  }
}
