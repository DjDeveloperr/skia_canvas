#include "include/svgcanvas.hpp"

extern "C" {
  SKIA_EXPORT sk_svg* sk_svg_new(int width, int height, int flags) {
    sk_svg* svg = new sk_svg();
    svg->stream = new SkDynamicMemoryWStream();
    svg->canvas = SkSVGCanvas::Make(SkRect::MakeWH(width, height), svg->stream, flags).release();
    if (svg->canvas == nullptr) {
      delete svg;
      return nullptr;
    }
    return svg;
  }

  SKIA_EXPORT void sk_svg_destroy(sk_svg* svg) {
    delete svg->canvas;
    delete svg->stream;
    delete svg;
  }

  SKIA_EXPORT sk_context* sk_svg_get_context(sk_svg* svg) {
    sk_context* ctx = new sk_context();
    ctx->canvas = svg->canvas;
    ctx->path = new SkPath();
    ctx->state = create_default_state();
    ctx->states = std::vector<sk_context_state>();
    return ctx;
  }

  SKIA_EXPORT int sk_svg_write_file(sk_svg* svg, char* path) {
    SkFILEWStream file(path);
    return svg->stream->writeToStream(&file);
  }

  SKIA_EXPORT SkData* sk_svg_get_buffer(sk_svg* svg, void** buffer, unsigned int* size) {
    SkData* data = svg->stream->detachAsData().release();
    *buffer = data->writable_data();
    *size = data->size();
    return data;
  }
}
