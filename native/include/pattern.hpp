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
  PatternRepeat repeat;
  SkImage* image;
} sk_pattern;

extern "C" {
  SKIA_EXPORT sk_pattern* sk_pattern_new_image(SkImage* image, PatternRepeat repeat);
  SKIA_EXPORT void sk_pattern_destroy(sk_pattern* pattern);

  sk_sp<SkShader> sk_pattern_to_shader(sk_pattern* pattern);
}
