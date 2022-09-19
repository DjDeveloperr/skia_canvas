#include <iostream>
#include "include/core/SkGraphics.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkData.h"
#include "include/core/SkImage.h"
#include "include/core/SkStream.h"
#include "include/core/SkSurface.h"

typedef struct sk_canvas {
    SkSurface* surface;
} sk_canvas;

#define SK_SURFACE(surface) reinterpret_cast<SkSurface *>(surface)

extern "C" {

sk_canvas* sk_create_canvas(int width, int height){
    SkGraphics::Init();
    sk_canvas* canvas = new sk_canvas();
    canvas->surface = SkSurface::MakeRasterN32Premul(width, height).release();
    return canvas;
}

void sk_destroy_canvas(sk_canvas* canvas) {
    SK_SURFACE(canvas->surface)->unref();
}

}
