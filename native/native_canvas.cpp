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

typedef struct sk_context_state {
  SkPaint* paint;
  float shadowOffsetX;
  float shadowOffsetY;
  float shadowBlur;
  std::vector<float> lineDash;
  float globalAlpha;
  float lineDashOffset;
  char* font;
  RGBA fillStyle;
  char* fillStyleString;
  RGBA strokeStyle;
  char* strokeStyleString;
  RGBA shadowColor;
  char* shadowColorString;
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
  state->font = strdup("10px sans-serif");
  state->fillStyle = {0, 0, 0, 255};
  state->fillStyleString = strdup("black");
  state->strokeStyle = {0, 0, 0, 255};
  state->strokeStyleString = strdup("black");
  state->shadowColor = {0, 0, 0, 255};
  state->shadowColorString = strdup("black");
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
  new_state->font = strdup(state->font);
  new_state->fillStyle = state->fillStyle;
  new_state->fillStyleString = strdup(state->fillStyleString);
  new_state->strokeStyle = state->strokeStyle;
  new_state->strokeStyleString = strdup(state->strokeStyleString);
  new_state->shadowColor = state->shadowColor;
  new_state->shadowColorString = strdup(state->shadowColorString);
  return new_state;
}

void free_context_state(sk_context_state* state) {
  delete state->paint;
  free(state->font);
  free(state->fillStyleString);
  free(state->strokeStyleString);
  free(state->shadowColorString);
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

extern "C" {
  sk_canvas* sk_create_canvas(int width, int height){
    SkGraphics::Init();
    sk_canvas* canvas = new sk_canvas();
    canvas->surface = SkSurface::MakeRasterN32Premul(width, height).release();
    return canvas;
  }

  void sk_destroy_canvas(sk_canvas* canvas) {
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
    context->path->reset();
  }

  void sk_context_move_to(sk_context* context, float x, float y) {
    context->path->moveTo(x, y);
  }

  void sk_context_line_to(sk_context* context, float x, float y) {
    context->path->lineTo(x, y);
  }

  void sk_context_close_path(sk_context* context) {
    context->path->close();
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

  void sk_destroy_context(sk_context* context) {
    delete context->path;
    delete context->state;
    delete context;
  }
}
