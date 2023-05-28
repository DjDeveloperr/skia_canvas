#include "include/common.hpp"
#include "include/core/SkStream.h"
#include "include/svg/SkSVGCanvas.h"
#include "include/context2d.hpp"

typedef struct sk_svg {
  SkDynamicMemoryWStream* stream;
  SkCanvas* canvas;
} sk_svg;

extern "C" {
  SKIA_EXPORT sk_svg* sk_svg_new(int width, int height, int flags);

  SKIA_EXPORT void sk_svg_destroy(sk_svg* svg);

  SKIA_EXPORT sk_context* sk_svg_get_context(sk_svg* svg);

  SKIA_EXPORT int sk_svg_write_file(sk_svg* svg, char* path);

  SKIA_EXPORT SkData* sk_svg_get_buffer(sk_svg* svg, void** buffer, unsigned int* size);

  SKIA_EXPORT void sk_svg_delete_canvas(sk_svg* svg);
}
