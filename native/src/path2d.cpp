#include "include/path2d.hpp"

#ifndef _USE_MATH_DEFINES
#define _USE_MATH_DEFINES
#include <math.h>
#endif

extern "C" {
  SkPath* sk_path_create() {
    return new SkPath();
  }

  SkPath* sk_path_create_copy(SkPath* path) {
    return new SkPath(*path);
  }

  SkPath* sk_path_from_svg_string(char* svg) {
    SkPath* path = new SkPath();
    SkParsePath::FromSVGString(svg, path);
    return path;
  }

  void sk_path_begin(SkPath* path) {
    path->reset();
  }

  void sk_path_move_to(SkPath* path, float x, float y) {
    path->moveTo(x, y);
  }

  void sk_path_line_to(SkPath* path, float x, float y) {
    path->lineTo(x, y);
  }

  void sk_path_rect(SkPath* path, float x, float y, float width, float height) {
    path->addRect(SkRect::MakeXYWH(x, y, width, height));
  }

  void sk_path_round_rect(SkPath* path, float x, float y, float width, float height, float tl, float tr, float br, float bl) {
    SkScalar radii[8] = { tl, tl, tr, tr, br, br, bl, bl };
    path->addRoundRect(SkRect::MakeXYWH(x, y, width, height), radii);
  }

  void sk_path_close(SkPath* path) {
    path->close();
  }

  void sk_path_arc_to(SkPath* path, float x1, float y1, float x2, float y2, float radius) {
    path->arcTo(x1, y1, x2, y2, radius);
  }

  void sk_path_ellipse(SkPath* path, float x, float y, float radiusX, float radiusY, float rotation, float startAngle, float endAngle, bool clockwise) {
    float tau = 2 * M_PI;
    float newStartAngle = fmod(startAngle, tau);
    if (newStartAngle < 0) {
      newStartAngle += tau;
    }
    float delta = newStartAngle - startAngle;
    startAngle = newStartAngle;
    endAngle = endAngle + delta;

    if (!clockwise && (endAngle - startAngle) >= tau) {
      endAngle = startAngle + tau;
    } else if (clockwise && (startAngle - endAngle) >= tau) {
      endAngle = startAngle - tau;
    } else if (!clockwise && startAngle > endAngle) {
      endAngle = startAngle + (tau - fmod(startAngle - endAngle, tau));
    } else if (clockwise && startAngle < endAngle) {
      endAngle = startAngle - (tau - fmod(endAngle - startAngle, tau));
    }

    float left = x - radiusX;
    float top = y - radiusY;
    float right = x + radiusX;
    float bottom = y + radiusY;

    SkMatrix* rotated = new SkMatrix();
    rotated->preTranslate(x, y);
    rotated->preRotate(DEGREES(rotation));
    rotated->preTranslate(-x, -y);
    SkMatrix* unrotated = new SkMatrix();
    rotated->invert(unrotated); // todo assert

    path->transform(*unrotated, SkApplyPerspectiveClip::kYes);

    float sweepDeg = DEGREES(endAngle - startAngle);
    float startDeg = DEGREES(startAngle);

    if (ALMOST_EQUAL(fabs(sweepDeg), 360.0f)) {
      float halfSweep = sweepDeg / 2.0f;
      path->arcTo(SkRect::MakeLTRB(left, top, right, bottom), startDeg, halfSweep, false);
      path->arcTo(
        SkRect::MakeLTRB(x - radiusX, y - radiusY, x + radiusX, y + radiusY),
        startDeg + halfSweep,
        halfSweep,
        false
      );
    } else {
      path->arcTo(SkRect::MakeLTRB(left, top, right, bottom), startDeg, sweepDeg, false);
    }

    path->transform(*rotated, SkApplyPerspectiveClip::kYes);

    delete rotated;
    delete unrotated;
  }

  void sk_path_arc(SkPath* path, float x, float y, float radius, float startAngle, float endAngle, bool clockwise) {
    sk_path_ellipse(path, x, y, radius, radius, 0, startAngle, endAngle, clockwise);
  }

  void sk_path_bezier_curve_to(SkPath* path, float cp1x, float cp1y, float cp2x, float cp2y, float x, float y) {
    path->cubicTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  void sk_path_quadratic_curve_to(SkPath* path, float cpx, float cpy, float x, float y) {
    path->quadTo(cpx, cpy, x, y);
  }

  int sk_path_is_point_in_path(SkPath* path, float x, float y, int rule) {
    auto prev = path->getFillType();
    path->setFillType(rule == 1 ? SkPathFillType::kEvenOdd : SkPathFillType::kWinding);
    auto result = (int) path->contains(x, y);
    path->setFillType(prev);
    return result;
  }

  int sk_path_is_point_in_stroke(SkPath* path, float x, float y, float strokeWidth) {
    auto prev = path->getFillType();
    path->setFillType(SkPathFillType::kWinding);
    SkPaint paint;
    paint.setStyle(SkPaint::kStroke_Style);
    paint.setStrokeWidth(strokeWidth);
    SkPath traced;
    int result;
    if (skpathutils::FillPathWithPaint(*path, paint, &traced, nullptr, 0.3)) {
      result = (int)traced.contains(x, y);
    } else {
      result = (int)path->contains(x, y);
    }
    path->setFillType(prev);
    return result;
  }

  SkString* sk_path_to_svg(SkPath* path, const char** outString, int* outSize) {
    auto string = new SkString(SkParsePath::ToSVGString(*path));
    *outString = string->c_str();
    *outSize = string->size();
    return string;
  }

  int sk_path_simplify(SkPath* path) {
    return (int) Simplify(*path, path);
  }

  int sk_path_as_winding(SkPath* path) {
    return (int) AsWinding(*path, path);
  }

  int sk_path_op(SkPath* p1, SkPath* p2, int op) {
    return (int) Op(*p1, *p2, (SkPathOp)op, p1);
  }

  void sk_path_add_path(SkPath* p1, SkPath* p2, float* t) {
    SkMatrix* mat = new SkMatrix();
    if (t != nullptr) {
      mat->setAll(t[0], t[1], t[2], t[3], t[4], t[5], 0.0f, 0.0f, 1.0f);
    }
    p1->addPath(*p2, *mat, SkPath::AddPathMode::kExtend_AddPathMode);
    delete mat;
  }

  void sk_free_string(SkString* str) {
    delete str;
  }

  void sk_path_destroy(SkPath* path) {
    delete path;
  }
}
