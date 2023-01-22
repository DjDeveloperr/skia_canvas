#include "include/canvas.hpp"
#include "include/context2d.hpp"

extern "C" {
  void sk_init() {
    SkGraphics::Init();
  }

  sk_canvas* sk_canvas_create(int width, int height) {
    sk_canvas* canvas = new sk_canvas();
    canvas->backend = kBackendCPU;
    canvas->surface = SkSurface::MakeRasterN32Premul(width, height).release();
    canvas->context_2d = sk_canvas_create_context(canvas);
    return canvas;
  }

  sk_canvas* sk_canvas_create_gl(int width, int height) {
    sk_canvas* canvas = new sk_canvas();
    canvas->backend = kBackendOpenGL;
    
    auto interface = GrGLMakeNativeInterface();

    if (interface == nullptr) {
      return nullptr;
    }

    canvas->context = GrDirectContext::MakeGL(interface).release();

    if (canvas->context == nullptr) {
      return nullptr;
    }

    GrGLFramebufferInfo framebufferInfo;
	  framebufferInfo.fFBOID = 0;
    framebufferInfo.fFormat = 32856;

    SkColorType colorType = kRGBA_8888_SkColorType;
	  GrBackendRenderTarget backendRenderTarget(width, height, 0, 0, framebufferInfo);
  
    canvas->surface = SkSurface::MakeFromBackendRenderTarget(
      canvas->context,
      backendRenderTarget,
      kBottomLeft_GrSurfaceOrigin,
      colorType,
      nullptr, // SkColorSpace::MakeSRGB(),
      nullptr
    ).release();

    if (canvas->surface == nullptr) {
      return nullptr;
    }

    canvas->context_2d = sk_canvas_create_context(canvas);

    return canvas;
  }

  void sk_canvas_flush(sk_canvas* canvas) {
    canvas->context->flush();
  }

  void sk_canvas_destroy(sk_canvas* canvas) {
    canvas->surface->unref();
    sk_context_destroy((sk_context*) canvas->context_2d);
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

  sk_context* sk_canvas_create_context(sk_canvas* canvas) {
    sk_context* context = new sk_context();
    
    context->canvas = canvas->surface->getCanvas();

    context->path = new SkPath();

    context->state = create_default_state();
    context->states = std::vector<sk_context_state*>();

    return context;
  }

  sk_context* sk_canvas_get_context(sk_canvas* canvas) {
    return (sk_context*) canvas->context_2d;
  }

  void sk_canvas_set_size(sk_canvas* canvas, int width, int height) {
    if (canvas->backend == kBackendCPU) {
      // Raster canvas
      canvas->surface->unref();
      sk_context_destroy((sk_context*) canvas->context_2d);
      canvas->surface = SkSurface::MakeRasterN32Premul(width, height).release();
      canvas->context_2d = sk_canvas_create_context(canvas);
    } else if (canvas->backend == kBackendOpenGL) {
      // OpenGL canvas
      canvas->surface->unref();
      sk_context_destroy((sk_context*) canvas->context_2d);
      GrGLFramebufferInfo framebufferInfo;
      framebufferInfo.fFBOID = 0;
      framebufferInfo.fFormat = 32856;
      SkColorType colorType = kRGBA_8888_SkColorType;
      GrBackendRenderTarget backendRenderTarget(width, height, 0, 0, framebufferInfo);
      canvas->surface = SkSurface::MakeFromBackendRenderTarget(
        canvas->context,
        backendRenderTarget,
        kBottomLeft_GrSurfaceOrigin,
        colorType,
        nullptr, // SkColorSpace::MakeSRGB(),
        nullptr
      ).release();
      canvas->context_2d = sk_canvas_create_context(canvas);
    }
  }
}
