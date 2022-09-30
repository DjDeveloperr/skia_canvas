#include "include/canvas.hpp"
#include "include/context2d.hpp"

extern "C" {
  sk_canvas* sk_canvas_create(int width, int height){
    SkGraphics::Init();
    sk_canvas* canvas = new sk_canvas();
    canvas->surface = SkSurface::MakeRasterN32Premul(width, height).release();
    return canvas;
  }

  void sk_canvas_destroy(sk_canvas* canvas) {
    canvas->surface->unref();
    delete canvas;
  }

  int sk_canvas_save(sk_canvas* canvas, char* path, int format, int quality) {
    auto info = canvas->surface->makeImageSnapshot();
    auto buf = info->encodeToData(format_from_int(format), quality);
    if (buf) {
      SkFILEWStream stream(path);
      if (stream.write(buf->data(), buf->size())) {
        stream.flush();
        buf.release();
        return 1;
      }
    }
    return 0;
  }

  void sk_canvas_read_pixels(sk_canvas* canvas, int x, int y, int width, int height, void* pixels) {
    canvas->surface->readPixels(SkImageInfo::MakeN32Premul(width, height), pixels, width * 4, x, y);
  }

  const void* sk_canvas_encode_image(sk_canvas* canvas, int format, int quality, int* size, SkData** data) {
    auto info = canvas->surface->makeImageSnapshot();
    auto buf = info->encodeToData(format_from_int(format), quality);
    if (buf) {
      auto ptr = buf->data();
      *size = buf->size();
      *data = buf.release();
      return ptr;
    }
    return nullptr;
  }

  void sk_data_free(SkData* data) {
    data->unref();
  }

  sk_context* sk_canvas_get_context(sk_canvas* canvas) {
    sk_context* context = new sk_context();
    
    context->canvas = canvas->surface->getCanvas();

    context->path = new SkPath();

    context->state = create_default_state();
    context->states = std::vector<sk_context_state>();

    return context;
  }
}
