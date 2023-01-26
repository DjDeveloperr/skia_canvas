#include "include/pattern.hpp"

extern "C" {
  SKIA_EXPORT sk_pattern* sk_pattern_new_image(SkImage* image, int repeat) {
    sk_pattern* pattern = new sk_pattern();
    auto bitmap = new SkBitmap();
    bitmap->allocPixels(SkImageInfo::MakeN32Premul(image->width(), image->height()));
    image->readPixels(bitmap->pixmap(), 0, 0);
    pattern->bitmap = bitmap;
    SkTileMode tmx, tmy;
    switch ((PatternRepeat)repeat) {
      case PatternRepeat::kRepeat:
        tmx = SkTileMode::kRepeat;
        tmy = SkTileMode::kRepeat;
        break;
      case PatternRepeat::kRepeatX:
        tmx = SkTileMode::kRepeat;
        tmy = SkTileMode::kClamp;
        break;
      case PatternRepeat::kRepeatY:
        tmx = SkTileMode::kClamp;
        tmy = SkTileMode::kRepeat;
        break;
      case PatternRepeat::kNoRepeat:
        tmx = SkTileMode::kClamp;
        tmy = SkTileMode::kClamp;
        break;
    }
    pattern->tmx = tmx;
    pattern->tmy = tmy;
    pattern->ts = SkMatrix::I();
    return pattern;
  }

  SKIA_EXPORT void sk_pattern_set_transform(
    sk_pattern* pattern,
    double a, double b, double c, double d, double e, double f
  ) {
    pattern->ts = SkMatrix::MakeAll(a, b, c, d, e, f, 0, 0, 1);
  }

  SKIA_EXPORT void sk_pattern_destroy(sk_pattern* pattern) {
    delete pattern->bitmap;
    delete pattern;
  }

  sk_sp<SkShader> sk_pattern_to_shader(sk_pattern* pattern) {
    auto shader = pattern->bitmap->makeShader(pattern->tmx, pattern->tmy, SkSamplingOptions({1.0f / 3.0f, 1.0f / 3.0f}), &pattern->ts);
    shader->ref();
    return shader;
  }
}
