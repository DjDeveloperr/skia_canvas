#include <iostream>
#include <vector>
#include "include/core/SkGraphics.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkData.h"
#include "include/core/SkImage.h"
#include "include/core/SkStream.h"
#include "include/core/SkSurface.h"
#include "include/core/SkEncodedImageFormat.h"
#include "include/core/SkPath.h"
#include "include/utils/SkParsePath.h"
#include "include/core/SkMatrix.h"
#include "./csscolorparser.hpp"

typedef struct sk_canvas {
  SkSurface* surface;
} sk_canvas;

typedef struct RGBA {
  uint8_t r;
  uint8_t g;
  uint8_t b;
  uint8_t a;
} RGBA;

typedef struct Style {
  unsigned char type;
  RGBA color;
} Style;

enum TextAlign {
  kLeft,
  kCenter,
  kRight
};

enum TextBaseline {
  kTop,
  kMiddle,
  kBottom
};

enum TextDirection {
  kLTR,
  kRTL
};

enum FilterQuality {
  kNone,
  kLow,
  kMedium,
  kHigh
};

enum FontStyle {
  kNormal,
  kItalic,
  kOblique
};

enum FontVariant {
  kNormal,
  kSmallCaps
};

enum FontStretch {
  kUltraCondensed = 1,
  kExtraCondensed,
  kCondensed,
  kSemiCondensed,
  kNormal,
  kSemiExpanded,
  kExpanded,
  kExtraExpanded,
  kUltraExpanded
};

typedef struct Font {
  float size;
  char* family;
  uint32_t weight;
  FontStyle style;
  FontVariant variant;
  FontStretch stretch;
} Font;

typedef struct sk_context_state {
  SkPaint* paint;
  float shadowOffsetX;
  float shadowOffsetY;
  float shadowBlur;
  std::vector<float> lineDash;
  float globalAlpha;
  float lineDashOffset;
  RGBA fillStyle;
  char* fillStyleString;
  RGBA strokeStyle;
  char* strokeStyleString;
  RGBA shadowColor;
  char* shadowColorString;
  SkMatrix* transform;
  bool imageSmoothingEnabled;
  FilterQuality imageSmoothingQuality;
  TextAlign textAlign;
  TextBaseline textBaseline;
  TextDirection direction;
  char* fontString;
  Font* font;
} sk_context_state;

sk_context_state* create_default_state() {
  sk_context_state* state = new sk_context_state();
  state->paint = new SkPaint();
  state->shadowOffsetX = 0;
  state->shadowOffsetY = 0;
  state->shadowBlur = 0;
  state->lineDash = std::vector<float>();
  state->globalAlpha = 1;
  state->lineDashOffset = 0;
  state->fillStyle = {0, 0, 0, 255};
  state->fillStyleString = strdup("black");
  state->strokeStyle = {0, 0, 0, 255};
  state->strokeStyleString = strdup("black");
  state->shadowColor = {0, 0, 0, 255};
  state->shadowColorString = strdup("black");
  state->transform = new SkMatrix();
  state->transform->setIdentity();
  state->imageSmoothingEnabled = true;
  state->imageSmoothingQuality = kLow;
  state->textAlign = kLeft;
  state->textBaseline = kTop;
  state->direction = kLTR;
  state->fontString = strdup("10px sans-serif");
  state->font = new Font();
  state->font->size = 10;
  state->font->family = strdup("sans-serif");
  state->font->weight = 400;
  state->font->style = FontStyle::kNormal;
  state->font->variant = FontVariant::kNormal;
  state->font->stretch = FontStretch::kNormal;
  return state;
}

sk_context_state* clone_context_state(sk_context_state* state) {
  sk_context_state* new_state = new sk_context_state();
  new_state->paint = new SkPaint(*state->paint);
  new_state->shadowOffsetX = state->shadowOffsetX;
  new_state->shadowOffsetY = state->shadowOffsetY;
  new_state->shadowBlur = state->shadowBlur;
  new_state->lineDash = state->lineDash;
  new_state->globalAlpha = state->globalAlpha;
  new_state->lineDashOffset = state->lineDashOffset;
  new_state->fontString = strdup(state->fontString);
  new_state->fillStyle = state->fillStyle;
  new_state->fillStyleString = strdup(state->fillStyleString);
  new_state->strokeStyle = state->strokeStyle;
  new_state->strokeStyleString = strdup(state->strokeStyleString);
  new_state->shadowColor = state->shadowColor;
  new_state->shadowColorString = strdup(state->shadowColorString);
  new_state->transform = new SkMatrix(*state->transform);
  new_state->imageSmoothingEnabled = state->imageSmoothingEnabled;
  new_state->imageSmoothingQuality = state->imageSmoothingQuality;
  new_state->textAlign = state->textAlign;
  new_state->textBaseline = state->textBaseline;
  new_state->direction = state->direction;
  new_state->font = new Font();
  new_state->font->size = state->font->size;
  new_state->font->family = strdup(state->font->family);
  new_state->font->weight = state->font->weight;
  new_state->font->style = state->font->style;
  new_state->font->variant = state->font->variant;
  new_state->font->stretch = state->font->stretch;
  return new_state;
}

void free_context_state(sk_context_state* state) {
  delete state->paint;
  delete state->transform;
  free(state->font);
  free(state->fillStyleString);
  free(state->strokeStyleString);
  free(state->shadowColorString);
  free(state->fontString);
  delete state;
}

typedef struct sk_context {
  SkCanvas* canvas;
  SkPath* path;
  std::vector<sk_context_state> states;
  sk_context_state* state;
} sk_context;

#define SK_SURFACE(surface) reinterpret_cast<SkSurface *>(surface)
#define SK_CANVAS(canvas) reinterpret_cast<SkCanvas *>(canvas)
#define SK_PATH(path) reinterpret_cast<SkPath *>(path)

#define DEGREES(radians) ((radians) * 180.0 / M_PI)
#define ALMOST_EQUAL(a, b) (fabs((a) - (b)) < 0.00001)

extern "C" {
  sk_canvas* sk_canvas_create(int width, int height){
    SkGraphics::Init();
    sk_canvas* canvas = new sk_canvas();
    canvas->surface = SkSurface::MakeRasterN32Premul(width, height).release();
    return canvas;
  }

  void sk_canvas_destroy(sk_canvas* canvas) {
    SK_SURFACE(canvas->surface)->unref();
    delete canvas;
  }

  bool sk_canvas_save(sk_canvas* canvas, char* path) {
    auto info = SK_SURFACE(canvas->surface)->makeImageSnapshot();
    auto buf = info->encodeToData(SkEncodedImageFormat::kPNG, 0);
    if (buf) {
      SkFILEWStream stream(path);
      if (stream.write(buf->data(), buf->size())) {
        stream.flush();
        return true;
      }
    }
    return false;
  }

  sk_context* sk_create_context(sk_canvas* canvas) {
    sk_context* context = new sk_context();
    
    context->canvas = SK_SURFACE(canvas->surface)->getCanvas();

    context->path = new SkPath();

    context->state = create_default_state();
    context->states = std::vector<sk_context_state>();

    return context;
  }

  void sk_context_save(sk_context* context) {
    context->states.push_back(*clone_context_state(context->state));
    SK_CANVAS(context->canvas)->save();
  }

  void sk_context_restore(sk_context* context) {
    if (context->states.size() > 0) {
      free_context_state(context->state);
      context->state = &context->states.back();
      context->states.pop_back();
      SK_CANVAS(context->canvas)->restore();
    }
  }

  void sk_context_clear_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = SK_CANVAS(context->canvas);
    SkPaint paint;
    paint.setARGB(0, 0, 0, 0);
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), paint);
  }

  char* sk_context_get_fill_style(sk_context* context) {
    return context->state->fillStyleString;
  }

  bool sk_context_set_fill_style(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->fillStyle = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      context->state->fillStyleString = strdup(style);
      return true;
    }
    return false;
  }

  char* sk_context_get_stroke_style(sk_context* context) {
    return context->state->strokeStyleString;
  }

  bool sk_context_set_stroke_style(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->strokeStyle = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      context->state->strokeStyleString = strdup(style);
      return true;
    }
    return false;
  }

  char* sk_context_get_shadow_color(sk_context* context) {
    return context->state->shadowColorString;
  }

  bool sk_context_set_shadow_color(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->shadowColor = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      context->state->shadowColorString = strdup(style);
      return true;
    }
    return false;
  }

  void sk_context_fill_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = SK_CANVAS(context->canvas);
    auto paint = context->state->paint;
    paint->setStroke(false);
    paint->setColor(SkColorSetARGB(context->state->fillStyle.a, context->state->fillStyle.r, context->state->fillStyle.g, context->state->fillStyle.b));
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), *paint);
  }

  void sk_context_stroke_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = SK_CANVAS(context->canvas);
    auto paint = context->state->paint;
    paint->setStroke(true);
    paint->setColor(SkColorSetARGB(context->state->strokeStyle.a, context->state->strokeStyle.r, context->state->strokeStyle.g, context->state->strokeStyle.b));
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), *paint);
  }

  void sk_context_begin_path(sk_context* context) {
    sk_path_begin(context->path);
  }

  void sk_context_move_to(sk_context* context, float x, float y) {
    sk_path_move_to(context->path, x, y);
  }

  void sk_context_line_to(sk_context* context, float x, float y) {
    sk_path_line_to(context->path, x, y);
  }

  void sk_context_rect(sk_context* context, float x, float y, float width, float height) {
    sk_path_rect(context->path, x, y, width, height);
  }

  void sk_context_arc_to(sk_context* context, float x1, float y1, float x2, float y2, float radius) {
    sk_path_arc_to(context->path, x1, y1, x2, y2, radius);
  }

  void sk_context_arc(sk_context* context, float x, float y, float radius, float startAngle, float endAngle, bool clockwise) {
    sk_path_arc(context->path, x, y, radius, startAngle, endAngle, clockwise);
  }

  void sk_context_ellipse(sk_context* context, float x, float y, float radiusX, float radiusY, float rotation, float startAngle, float endAngle, bool clockwise) {
    sk_path_ellipse(context->path, x, y, radiusX, radiusY, rotation, startAngle, endAngle, clockwise);
  }

  void sk_context_close_path(sk_context* context) {
    context->path->close();
  }

  void sk_context_clip(sk_context* context, SkPath* path, unsigned char rule) {
    if (path == nullptr) path = context->path;
    // Should we clone?
    // path = new SkPath(*path);
    path->setFillType(rule == 1 ? SkPathFillType::kEvenOdd : SkPathFillType::kWinding);
    SK_CANVAS(context->canvas)->clipPath(*path);
  }

  void sk_context_fill(sk_context* context) {
    auto canvas = SK_CANVAS(context->canvas);
    auto paint = context->state->paint;
    paint->setStroke(false);
    paint->setColor(SkColorSetARGB(context->state->fillStyle.a, context->state->fillStyle.r, context->state->fillStyle.g, context->state->fillStyle.b));
    canvas->drawPath(*context->path, *paint);
  }

  void sk_context_stroke(sk_context* context) {
    auto canvas = SK_CANVAS(context->canvas);
    auto paint = context->state->paint;
    paint->setStroke(true);
    paint->setColor(SkColorSetARGB(context->state->strokeStyle.a, context->state->strokeStyle.r, context->state->strokeStyle.g, context->state->strokeStyle.b));
    canvas->drawPath(*context->path, *paint);
  }

  float sk_context_get_line_width(sk_context* context) {
    return context->state->paint->getStrokeWidth();
  }

  void sk_context_set_line_width(sk_context* context, float width) {
    context->state->paint->setStrokeWidth(width);
  }

  float sk_context_get_miter_limit(sk_context* context) {
    return context->state->paint->getStrokeMiter();
  }

  void sk_context_set_miter_limit(sk_context* context, float limit) {
    context->state->paint->setStrokeMiter(limit);
  }

  float sk_context_get_global_alpha(sk_context* context) {
    return context->state->paint->getAlpha() / 255.0f;
  }

  void sk_context_set_global_alpha(sk_context* context, float alpha) {
    context->state->paint->setAlpha(alpha * 255);
  }

  void sk_context_destroy(sk_context* context) {
    delete context->path;
    delete context->state;
    delete context;
  }

  SkPath* sk_path_create() {
    return new SkPath();
  }

  SkPath* sk_path_create_copy(SkPath* path) {
    return new SkPath(*path);
  }

  SkPath* sk_path_create_from_svg(char* svg) {
    SkPath* path = new SkPath();
    SkParsePath::FromSVGString(svg, path);
    return path;
  }

  void sk_path_begin(SkPath* path) {
    path->reset();
  }

  void sk_path_move_to(SkPath* path, float x, float y) {
    path->moveTo(x, y);
  }

  void sk_path_line_to(SkPath* path, float x, float y) {
    path->lineTo(x, y);
  }

  void sk_path_rect(SkPath* path, float x, float y, float width, float height) {
    path->addRect(SkRect::MakeXYWH(x, y, width, height));
  }

  void sk_path_close(SkPath* path) {
    path->close();
  }

  void sk_path_arc_to(SkPath* path, float x1, float y1, float x2, float y2, float radius) {
    path->arcTo(x1, y1, x2, y2, radius);
  }

  void sk_path_arc(SkPath* path, float x, float y, float radius, float startAngle, float endAngle, bool clockwise) {
    sk_path_ellipse(path, x, y, radius, radius, 0, startAngle, endAngle, clockwise);
  }

  void sk_path_ellipse(SkPath* path, float x, float y, float radiusX, float radiusY, float rotation, float startAngle, float endAngle, bool clockwise) {
    float tau = 2 * M_PI;
    float newStartAngle = fmod(startAngle, tau);
    if (newStartAngle < 0) {
      newStartAngle += tau;
    }
    float delta = newStartAngle - startAngle;
    startAngle = newStartAngle;
    endAngle = endAngle + delta;

    if (!clockwise && (endAngle - startAngle) >= tau) {
      endAngle = startAngle + tau;
    } else if (clockwise && (startAngle - endAngle) >= tau) {
      endAngle = startAngle - tau;
    } else if (!clockwise && startAngle > endAngle) {
      endAngle = startAngle + (tau - fmod(startAngle - endAngle, tau));
    } else if (clockwise && startAngle < endAngle) {
      endAngle = startAngle - (tau - fmod(endAngle - startAngle, tau));
    }

    float left = x - radiusX;
    float top = y - radiusY;
    float right = x + radiusX;
    float bottom = y + radiusY;

    SkMatrix* rotated = new SkMatrix();
    rotated->preTranslate(x, y);
    rotated->preRotate(DEGREES(rotation));
    rotated->preTranslate(-x, -y);
    SkMatrix* unrotated = new SkMatrix();
    rotated->invert(unrotated); // todo assert

    path->transform(*unrotated, SkApplyPerspectiveClip::kYes);

    float sweepDeg = DEGREES(endAngle - startAngle);
    float startDeg = DEGREES(startAngle);

    if (ALMOST_EQUAL(fabs(sweepDeg), 360.0f)) {
      float halfSweep = sweepDeg / 2.0f;
      path->arcTo(SkRect::MakeLTRB(left, top, right, bottom), startDeg, halfSweep, false);
      path->arcTo(
        SkRect::MakeLTRB(x - radiusX, y - radiusY, x + radiusX, y + radiusY),
        startDeg + halfSweep,
        halfSweep,
        false
      );
    } else {
      path->arcTo(SkRect::MakeLTRB(left, top, right, bottom), startDeg, sweepDeg, false);
    }

    path->transform(*rotated, SkApplyPerspectiveClip::kYes);
  }

  void sk_path_bezier_curve_to(SkPath* path, float cp1x, float cp1y, float cp2x, float cp2y, float x, float y) {
    path->cubicTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  void sk_path_quadratic_curve_to(SkPath* path, float cpx, float cpy, float x, float y) {
    path->quadTo(cpx, cpy, x, y);
  }

  void sk_path_destroy(SkPath* path) {
    delete path;
  }
}
