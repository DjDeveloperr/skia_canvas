#pragma once

#include "include/core/SkPath.h"
#include "include/utils/SkParsePath.h"
#include "include/core/SkMatrix.h"
#include "include/common.hpp"

extern "C" {
  SKIA_EXPORT SkPath* sk_path_create();
  SKIA_EXPORT SkPath* sk_path_create_copy(SkPath* path);
  SKIA_EXPORT SkPath* sk_path_from_svg_string(char* svg);
  SKIA_EXPORT void sk_path_begin(SkPath* path);
  SKIA_EXPORT void sk_path_move_to(SkPath* path, float x, float y);
  SKIA_EXPORT void sk_path_line_to(SkPath* path, float x, float y);
  SKIA_EXPORT void sk_path_rect(SkPath* path, float x, float y, float width, float height);
  SKIA_EXPORT void sk_path_round_rect(SkPath* path, float x, float y, float width, float height, float tl, float tr, float br, float bl);
  SKIA_EXPORT void sk_path_close(SkPath* path);
  SKIA_EXPORT void sk_path_arc_to(SkPath* path, float x1, float y1, float x2, float y2, float radius);
  SKIA_EXPORT void sk_path_ellipse(SkPath* path, float x, float y, float radiusX, float radiusY, float rotation, float startAngle, float endAngle, bool clockwise);
  SKIA_EXPORT void sk_path_arc(SkPath* path, float x, float y, float radius, float startAngle, float endAngle, bool clockwise);
  SKIA_EXPORT void sk_path_bezier_curve_to(SkPath* path, float cp1x, float cp1y, float cp2x, float cp2y, float x, float y);
  SKIA_EXPORT void sk_path_quadratic_curve_to(SkPath* path, float cpx, float cpy, float x, float y);
  SKIA_EXPORT void sk_path_destroy(SkPath* path);
}
