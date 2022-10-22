#include "include/pattern.hpp"

extern "C" {
  SKIA_EXPORT sk_pattern* sk_pattern_new_image(SkImage* image, PatternRepeat repeat) {
    sk_pattern* pattern = new sk_pattern();
    pattern->image = image;
    pattern->repeat = repeat;
    SkBitmap;
    return pattern;
  }

  SKIA_EXPORT void sk_pattern_destroy(sk_pattern* pattern) {
    delete pattern;
  }

  // sk_sp<SkShader> sk_pattern_to_shader(sk_pattern* pattern) {
    
  // }
}
