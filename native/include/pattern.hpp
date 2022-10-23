#include "include/common.hpp"
#include "include/image.hpp"
#include "include/core/SkShader.h"
#include "include/core/SkBitmap.h"

enum PatternRepeat {
  kRepeat,
  kRepeatX,
  kRepeatY,
  kNoRepeat,
};

typedef struct sk_pattern {
  SkTileMode tmx;
  SkTileMode tmy;
  SkBitmap* bitmap;
  SkMatrix ts;
} sk_pattern;

extern "C" {
  SKIA_EXPORT sk_pattern* sk_pattern_new_image(SkImage* image, int repeat);
  SKIA_EXPORT void sk_pattern_destroy(sk_pattern* pattern);
  SKIA_EXPORT void sk_pattern_set_transform(
    sk_pattern* pattern,
    double a, double b, double c, double d, double e, double f
  );

  sk_sp<SkShader> sk_pattern_to_shader(sk_pattern* pattern);
}
