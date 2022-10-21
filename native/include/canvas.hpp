#pragma once

#include "include/core/SkGraphics.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkSurface.h"
#include "include/core/SkData.h"
#include "include/core/SkImageInfo.h"
#include "include/common.hpp"

typedef struct sk_canvas {
  SkSurface* surface;
  void* pixels;
} sk_canvas;

typedef struct sk_context_state {
  SkPaint* paint;
  float shadowOffsetX;
  float shadowOffsetY;
  float shadowBlur;
  std::vector<float> lineDash;
  float globalAlpha;
  float lineDashOffset;
  Style fillStyle;
  Style strokeStyle;
  RGBA shadowColor;
  SkMatrix* transform;
  bool imageSmoothingEnabled;
  FilterQuality imageSmoothingQuality;
  TextAlign textAlign;
  TextBaseline textBaseline;
  TextDirection direction;
  Font* font;
} sk_context_state;

typedef struct sk_context {
  SkCanvas* canvas;
  SkPath* path;
  std::vector<sk_context_state> states;
  sk_context_state* state;
} sk_context;

extern "C" {
  SKIA_EXPORT void sk_init();
  SKIA_EXPORT sk_canvas* sk_canvas_create(int width, int height, void* pixels);
  SKIA_EXPORT void sk_canvas_destroy(sk_canvas* canvas);
  SKIA_EXPORT int sk_canvas_save(sk_canvas* canvas, char* path, int format, int quality);
  SKIA_EXPORT void sk_canvas_read_pixels(sk_canvas* canvas, int x, int y, int width, int height, void* pixels, int cs);
  SKIA_EXPORT const void* sk_canvas_encode_image(sk_canvas* canvas, int format, int quality, int* size, SkData** data);
  SKIA_EXPORT void sk_data_free(SkData* data);
  SKIA_EXPORT sk_context* sk_canvas_get_context(sk_canvas* canvas);
}
