#include "include/canvas.hpp"
#include "include/context2d.hpp"

extern "C" {
  void sk_init() {
    SkGraphics::Init();
  }

  sk_canvas* sk_canvas_create(int width, int height, void* pixels) {
    sk_canvas* canvas = new sk_canvas();
    SkImageInfo info = SkImageInfo::MakeN32Premul(width, height);
    size_t rowBytes = info.minRowBytes();
    size_t size = info.computeByteSize(rowBytes);
    canvas->pixels = pixels == nullptr ? malloc(size) : pixels;
    canvas->surface = SkSurface::MakeRasterDirect(info, canvas->pixels, rowBytes).release();
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

  void sk_canvas_read_pixels(sk_canvas* canvas, int x, int y, int width, int height, void* pixels, int cs) {
    canvas->surface->readPixels(SkImageInfo::Make(width, height, SkColorType::kRGBA_8888_SkColorType, SkAlphaType::kUnpremul_SkAlphaType, cs == 0 ? SkColorSpace::MakeSRGB() : SkColorSpace::MakeRGB(SkNamedTransferFn::kSRGB, SkNamedGamut::kDisplayP3)), pixels, width * 4, x, y);
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
