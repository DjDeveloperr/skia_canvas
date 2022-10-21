#include "include/core/SkPaint.h"
#include "include/core/SkShader.h"
#include "include/effects/SkGradientShader.h"
#include "include/core/SkColor.h"
#include "include/core/SkPoint.h"
#include "include/core/SkTileMode.h"
#include "deps/csscolorparser.hpp"
#include "include/common.hpp"
#include <vector>

enum GradientType {
  Linear,
  Radial,
  Conic,
};

typedef struct floatx2 {
  float x;
  float y;
} floatx2;

typedef struct sk_linear_gradient {
  floatx2 start;
  floatx2 end;
} sk_linear_gradient;

typedef struct sk_radial_gradient {
  floatx2 startCenter;
  float startRadius;
  floatx2 endCenter;
  float endRadius;
} sk_radial_gradient;

typedef struct sk_conic_gradient {
  floatx2 center;
  float radius;
} sk_conic_gradient;

typedef struct sk_gradient {
  std::vector<SkScalar> positions;
  std::vector<SkColor> colors;
  SkTileMode tileMode;
  SkMatrix transform;
  GradientType type;
  void* data;
} sk_gradient;

extern "C" {
  SKIA_EXPORT sk_gradient* sk_gradient_create_linear(float startX, float startY, float endX, float endY);
  SKIA_EXPORT sk_gradient* sk_gradient_create_radial(float startCenterX, float startCenterY, float startRadius, float endCenterX, float endCenterY, float endRadius);
  SKIA_EXPORT sk_gradient* sk_gradient_create_conic(float centerX, float centerY, float radius);
  
  SKIA_EXPORT void sk_gradient_destroy(sk_gradient* gradient);

  SKIA_EXPORT int sk_gradient_add_color_stop(sk_gradient* gradient, float position, char* color);
  
  sk_sp<SkShader> sk_gradient_to_shader(sk_gradient* gradient, SkMatrix* ct);
}
