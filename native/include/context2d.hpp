#pragma once

#include <iostream>
#include <vector>
#include "include/core/SkCanvas.h"
#include "include/core/SkEncodedImageFormat.h"
#include "include/core/SkPath.h"
#include "include/utils/SkParsePath.h"
#include "include/core/SkMatrix.h"
#include "include/core/SkPaint.h"
#include "include/core/SkBitmap.h"
#include "include/core/SkFont.h"
#include "include/core/SkFontMgr.h"
#include "include/core/SkColorSpace.h"
#include "modules/skparagraph/include/FontCollection.h"
#include "modules/skparagraph/include/TypefaceFontProvider.h"
#include "modules/skparagraph/include/ParagraphStyle.h"
#include "modules/skparagraph/include/ParagraphBuilder.h"
#include "modules/skparagraph/src/ParagraphBuilderImpl.h"
#include "modules/skparagraph/src/ParagraphImpl.h"
#include "include/effects/SkColorMatrix.h"
#include "include/effects/SkDashPathEffect.h"
#include "include/effects/SkImageFilters.h"
#include "include/effects/SkTableColorFilter.h"
#include "include/effects/SkTrimPathEffect.h"
#include "include/core/SkPathEffect.h"
#include "deps/csscolorparser.hpp"
#include "include/common.hpp"
#include "include/font.hpp"
#include "include/canvas.hpp"
#include "include/path2d.hpp"
#include "include/gradient.hpp"

sk_context_state* create_default_state();
sk_context_state* clone_context_state(sk_context_state* state);
void free_context_state(sk_context_state* state);

extern "C" {
  SKIA_EXPORT void sk_context_clear_rect(sk_context* context, float x, float y, float width, float height);
  SKIA_EXPORT void sk_context_fill_rect(sk_context* context, float x, float y, float width, float height);
  SKIA_EXPORT void sk_context_stroke_rect(sk_context* context, float x, float y, float width, float height);

  SKIA_EXPORT int sk_context_text(sk_context* context,
    char* text,
    int textLen,
    float x,
    float y,
    float maxWidth,
    int fill,
    sk_line_metrics* out_metrics
  );

  SKIA_EXPORT float sk_context_get_line_width(sk_context* context);
  SKIA_EXPORT void sk_context_set_line_width(sk_context* context, float width);
  SKIA_EXPORT int sk_context_get_line_cap(sk_context* context);
  SKIA_EXPORT void sk_context_set_line_cap(sk_context* context, int cap);
  SKIA_EXPORT int sk_context_get_line_join(sk_context* context);
  SKIA_EXPORT void sk_context_set_line_join(sk_context* context, int join);
  SKIA_EXPORT float sk_context_get_miter_limit(sk_context* context);
  SKIA_EXPORT void sk_context_set_miter_limit(sk_context* context, float limit);
  SKIA_EXPORT void sk_context_set_line_dash(sk_context* context, float* dash, int count);
  SKIA_EXPORT float sk_context_get_line_dash_offset(sk_context* context);
  SKIA_EXPORT void sk_context_set_line_dash_offset(sk_context* context, float offset);

  SKIA_EXPORT void sk_context_set_font(
    sk_context* context,
    float size,
    char* family,
    unsigned int weight,
    int style,
    int variant,
    int stretch
  );
  SKIA_EXPORT int sk_context_get_text_align(sk_context* context);
  SKIA_EXPORT void sk_context_set_text_align(sk_context* context, int align);
  SKIA_EXPORT int sk_context_get_text_baseline(sk_context* context);
  SKIA_EXPORT void sk_context_set_text_baseline(sk_context* context, int baseline);
  SKIA_EXPORT int sk_context_get_text_direction(sk_context* context);
  SKIA_EXPORT void sk_context_set_text_direction(sk_context* context, int direction);

  SKIA_EXPORT int sk_context_set_fill_style(sk_context* context, char* style);
  SKIA_EXPORT void sk_context_set_fill_style_gradient(sk_context* context, sk_gradient* gradient);
  SKIA_EXPORT int sk_context_set_stroke_style(sk_context* context, char* style);
  SKIA_EXPORT void sk_context_set_stroke_style_gradient(sk_context* context, sk_gradient* gradient);

  SKIA_EXPORT float sk_context_get_shadow_blur(sk_context* context);
  SKIA_EXPORT void sk_context_set_shadow_blur(sk_context* context, float blur);
  SKIA_EXPORT int sk_context_set_shadow_color(sk_context* context, char* style);
  SKIA_EXPORT float sk_context_get_shadow_offset_x(sk_context* context);
  SKIA_EXPORT void sk_context_set_shadow_offset_x(sk_context* context, float x);
  SKIA_EXPORT float sk_context_get_shadow_offset_y(sk_context* context);
  SKIA_EXPORT void sk_context_set_shadow_offset_y(sk_context* context, float y);
  
  SKIA_EXPORT void sk_context_begin_path(sk_context* context);
  SKIA_EXPORT void sk_context_close_path(sk_context* context);
  SKIA_EXPORT void sk_context_move_to(sk_context* context, float x, float y);
  SKIA_EXPORT void sk_context_line_to(sk_context* context, float x, float y);
  SKIA_EXPORT void sk_context_bezier_curve_to(sk_context* context, float cp1x, float cp1y, float cp2x, float cp2y, float x, float y);
  SKIA_EXPORT void sk_context_quadratic_curve_to(sk_context* context, float cpx, float cpy, float x, float y);
  SKIA_EXPORT void sk_context_arc(sk_context* context, float x, float y, float radius, float startAngle, float endAngle, bool clockwise);
  SKIA_EXPORT void sk_context_arc_to(sk_context* context, float x1, float y1, float x2, float y2, float radius);
  SKIA_EXPORT void sk_context_ellipse(sk_context* context, float x, float y, float radiusX, float radiusY, float rotation, float startAngle, float endAngle, bool clockwise);
  SKIA_EXPORT void sk_context_rect(sk_context* context, float x, float y, float width, float height);
  SKIA_EXPORT void sk_context_round_rect(sk_context* context, float x, float y, float width, float height, float tl, float tr, float br, float bl);

  SKIA_EXPORT void sk_context_fill(sk_context* context, SkPath* path, unsigned char rule);
  SKIA_EXPORT void sk_context_stroke(sk_context* context, SkPath* path);
  SKIA_EXPORT void sk_context_clip(sk_context* context, SkPath* path, unsigned char rule);
  SKIA_EXPORT int sk_context_is_point_in_path(sk_context* context, float x, float y, SkPath* path, int rule);
  SKIA_EXPORT int sk_context_is_point_in_stroke(sk_context* context, float x, float y, SkPath* path);

  SKIA_EXPORT void sk_context_get_transform(sk_context* context, float* m);
  SKIA_EXPORT void sk_context_rotate(sk_context* context, float angle);
  SKIA_EXPORT void sk_context_scale(sk_context* context, float x, float y);
  SKIA_EXPORT void sk_context_translate(sk_context* context, float x, float y);
  SKIA_EXPORT void sk_context_transform(sk_context* context, float a, float b, float c, float d, float e, float f);
  SKIA_EXPORT void sk_context_set_transform(sk_context* context, float a, float b, float c, float d, float e, float f);
  SKIA_EXPORT void sk_context_reset_transform(sk_context* context);

  SKIA_EXPORT float sk_context_get_global_alpha(sk_context* context);
  SKIA_EXPORT void sk_context_set_global_alpha(sk_context* context, float alpha);
  SKIA_EXPORT int sk_context_get_global_composite_operation(sk_context* context);
  SKIA_EXPORT void sk_context_set_global_composite_operation(sk_context* context, unsigned char op);

  SKIA_EXPORT void sk_context_draw_image(
    sk_context* context,
    sk_canvas* canvas,
    SkImage* image,
    float sx,
    float sy,
    float sw,
    float sh,
    float dx,
    float dy,
    float dw,
    float dh
  );

  SKIA_EXPORT void sk_context_put_image_data(sk_context* context, int width, int height, uint8_t *pixels, int row_bytes, float x, float y);
  SKIA_EXPORT void sk_context_put_image_data_dirty(sk_context* context, int width, int height, uint8_t *pixels, int row_bytes, int length, float x, float y, float dirty_x, float dirty_y, float dirty_width, float dirty_height, uint8_t cs);

  SKIA_EXPORT int sk_context_get_image_smoothing_enabled(sk_context* context);
  SKIA_EXPORT void sk_context_set_image_smoothing_enabled(sk_context* context, int enabled);
  SKIA_EXPORT int sk_context_get_image_smoothing_quality(sk_context* context);
  SKIA_EXPORT void sk_context_set_image_smoothing_quality(sk_context* context, int quality);

  SKIA_EXPORT void sk_context_save(sk_context* context);
  SKIA_EXPORT void sk_context_restore(sk_context* context);
  
  SKIA_EXPORT void sk_context_destroy(sk_context* context);
}
