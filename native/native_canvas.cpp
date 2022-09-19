#include <iostream>
#include "include/core/SkGraphics.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkData.h"
#include "include/core/SkImage.h"
#include "include/core/SkStream.h"
#include "include/core/SkSurface.h"
#include "include/core/SkEncodedImageFormat.h"

typedef struct sk_canvas {
  SkSurface* surface;
} sk_canvas;

typedef struct sk_context_state {

} sk_context_state;

typedef struct sk_context {
  SkCanvas* canvas;
  sk_context_state* state;
} sk_context;

#define SK_SURFACE(surface) reinterpret_cast<SkSurface *>(surface)
#define SK_CANVAS(canvas) reinterpret_cast<SkCanvas *>(canvas)

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
    context->state = new sk_context_state();
    return context;
  }

  void sk_context_clear_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = SK_CANVAS(context->canvas);
    SkPaint paint;
    paint.setColor(SK_ColorBLACK);
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), paint);
  }

  void sk_destroy_context(sk_context* context) {
    delete context;
  }
}
