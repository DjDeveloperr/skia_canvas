#include "include/canvas.hpp"
#include "include/context2d.hpp"

void error_callback(int error, const char* description) {
	std::cerr << "skia_canvas: glfw error (" << error << "): " << description << std::endl;
}

extern "C" {
  void sk_init() {
    // if (glfwInit()) {
    //   glfwSetErrorCallback(error_callback);
    //   glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    //   glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 2);
    //   glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
    //   glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    //   // glfwWindowHint(GLFW_SRGB_CAPABLE, GL_TRUE);
    //   glfwWindowHint(GLFW_STENCIL_BITS, 0);
    //   // glfwWindowHint(GLFW_ALPHA_BITS, 0);
    //   glfwWindowHint(GLFW_DEPTH_BITS, 0);
    // }
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

  sk_canvas* sk_canvas_create_gl(int width, int height) {
    sk_canvas* canvas = new sk_canvas();
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

    return canvas;
  }

  void sk_canvas_flush(sk_canvas* canvas) {
    canvas->context->flush();
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
