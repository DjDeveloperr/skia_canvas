#include "include/context2d.hpp"

extern sk_sp<skia::textlayout::FontCollection> fontCollection;

sk_context_state* create_default_state() {
  sk_context_state* state = new sk_context_state();
  state->paint = new SkPaint();
  state->shadowOffsetX = 0;
  state->shadowOffsetY = 0;
  state->shadowBlur = 0;
  state->lineDash = std::vector<float>();
  state->globalAlpha = 1;
  state->lineDashOffset = 0;
  state->fillStyle = {0, 0, 0, 255};
  state->strokeStyle = {0, 0, 0, 255};
  state->shadowColor = {0, 0, 0, 255};
  state->transform = new SkMatrix();
  state->transform->setIdentity();
  state->imageSmoothingEnabled = true;
  state->imageSmoothingQuality = kLow;
  state->textAlign = kLeft;
  state->textBaseline = kTop;
  state->direction = kLTR;
  state->font = new Font();
  state->font->size = 10;
  state->font->family = strdup("DejaVu Sans");
  state->font->weight = 400;
  state->font->style = FontStyle::kNormalStyle;
  state->font->variant = FontVariant::kNormalVariant;
  state->font->stretch = FontStretch::kNormal;
  return state;
}

sk_context_state* clone_context_state(sk_context_state* state) {
  sk_context_state* new_state = new sk_context_state();
  new_state->paint = new SkPaint(*state->paint);
  new_state->shadowOffsetX = state->shadowOffsetX;
  new_state->shadowOffsetY = state->shadowOffsetY;
  new_state->shadowBlur = state->shadowBlur;
  new_state->lineDash = state->lineDash;
  new_state->globalAlpha = state->globalAlpha;
  new_state->lineDashOffset = state->lineDashOffset;
  new_state->fillStyle = state->fillStyle;
  new_state->strokeStyle = state->strokeStyle;
  new_state->shadowColor = state->shadowColor;
  new_state->transform = new SkMatrix(*state->transform);
  new_state->imageSmoothingEnabled = state->imageSmoothingEnabled;
  new_state->imageSmoothingQuality = state->imageSmoothingQuality;
  new_state->textAlign = state->textAlign;
  new_state->textBaseline = state->textBaseline;
  new_state->direction = state->direction;
  new_state->font = new Font();
  new_state->font->size = state->font->size;
  new_state->font->family = strdup(state->font->family);
  new_state->font->weight = state->font->weight;
  new_state->font->style = state->font->style;
  new_state->font->variant = state->font->variant;
  new_state->font->stretch = state->font->stretch;
  return new_state;
}

void free_context_state(sk_context_state* state) {
  delete state->paint;
  delete state->transform;
  free(state->font);
  delete state;
}

extern "C" {
  void sk_context_save(sk_context* context) {
    context->states.push_back(*clone_context_state(context->state));
    context->canvas->save();
  }

  void sk_context_restore(sk_context* context) {
    if (context->states.size() > 0) {
      free_context_state(context->state);
      context->state = &context->states.back();
      context->states.pop_back();
      context->canvas->restore();
    }
  }

  void sk_context_clear_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = context->canvas;
    SkPaint paint;
    paint.setARGB(0, 0, 0, 0);
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), paint);
  }

  int sk_context_set_fill_style(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->fillStyle = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      return 1;
    }
    return 0;
  }

  SkPaint* sk_context_fill_paint(sk_context_state* state) {
    SkPaint* paint = new SkPaint(*state->paint);
    paint->setStyle(SkPaint::kFill_Style);
    paint->setColor(SkColorSetARGB(state->fillStyle.a, state->fillStyle.r, state->fillStyle.g, state->fillStyle.b));
    return paint;
  }

  SkPaint* sk_context_stroke_paint(sk_context_state* state) {
    SkPaint* paint = new SkPaint(*state->paint);
    paint->setStyle(SkPaint::kStroke_Style);
    paint->setColor(SkColorSetARGB(state->strokeStyle.a, state->strokeStyle.r, state->strokeStyle.g, state->strokeStyle.b));
    return paint;
  }

  int sk_context_set_stroke_style(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->strokeStyle = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      return 1;
    }
    return 0;
  }

  int sk_context_set_shadow_color(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->shadowColor = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      return 1;
    }
    return 0;
  }

  int sk_context_get_line_cap(sk_context* context) {
    auto cap = context->state->paint->getStrokeCap();
    switch (cap) {
      case SkPaint::kButt_Cap:
        return 0;
      case SkPaint::kRound_Cap:
        return 1;
      case SkPaint::kSquare_Cap:
        return 2;
    }
  }

  void sk_context_set_line_cap(sk_context* context, int cap) {
    switch (cap) {
      case 0:
        context->state->paint->setStrokeCap(SkPaint::kButt_Cap);
        break;
      case 1:
        context->state->paint->setStrokeCap(SkPaint::kRound_Cap);
        break;
      case 2:
        context->state->paint->setStrokeCap(SkPaint::kSquare_Cap);
        break;
    }
  }

  float sk_context_get_line_dash_offset(sk_context* context) {
    return context->state->lineDashOffset;
  }

  void sk_context_set_line_dash_offset(sk_context* context, float offset) {
    context->state->lineDashOffset = offset;
  }

  int sk_context_get_text_direction(sk_context* context) {
    return context->state->direction;
  }

  void sk_context_set_text_direction(sk_context* context, int direction) {
    context->state->direction = TextDirection(direction);
  }

  int sk_context_get_text_align(sk_context* context) {
    return context->state->textAlign;
  }

  void sk_context_set_text_align(sk_context* context, int align) {
    context->state->textAlign = TextAlign(align);
  }

  int sk_context_get_text_baseline(sk_context* context) {
    return context->state->textBaseline;
  }

  void sk_context_set_text_baseline(sk_context* context, int baseline) {
    context->state->textBaseline = TextBaseline(baseline);
  }

  float sk_context_get_shadow_blur(sk_context* context) {
    return context->state->shadowBlur;
  }

  void sk_context_set_shadow_blur(sk_context* context, float blur) {
    context->state->shadowBlur = blur;
  }

  void sk_context_get_shadow_offset_x(sk_context* context, float* x) {
    *x = context->state->shadowOffsetX;
  }

  void sk_context_set_shadow_offset_x(sk_context* context, float x) {
    context->state->shadowOffsetX = x;
  }

  void sk_context_get_shadow_offset_y(sk_context* context, float* y) {
    *y = context->state->shadowOffsetY;
  }

  void sk_context_set_shadow_offset_y(sk_context* context, float y) {
    context->state->shadowOffsetY = y;
  }

  void sk_context_set_font(
    sk_context* context,
    float size,
    char* family,
    unsigned int weight,
    int style,
    int variant,
    int stretch
  ) {
    context->state->font = new Font();
    context->state->font->family = strdup(family);
    context->state->font->size = size;
    context->state->font->weight = weight;
    context->state->font->style = FontStyle(style);
    context->state->font->variant = FontVariant(variant);
    context->state->font->stretch = FontStretch(stretch);
  }

  int sk_context_text(
    sk_context* context,
    char* text,
    int textLen,
    float x,
    float y,
    float maxWidth,
    int fill,
    sk_line_metrics* out_metrics
  ) {
    SkTArray<SkString> families;
    SkStrSplit(context->state->font->family, ",", &families);
    std::vector<SkString> familyVec;
    for (auto& family : families) {
      familyVec.emplace_back(family);
    }

    skia::textlayout::TextStyle tstyle;
    tstyle.setTextBaseline(skia::textlayout::TextBaseline::kAlphabetic);
    tstyle.setFontFamilies(familyVec);
    tstyle.setFontSize(context->state->font->size);
    tstyle.setWordSpacing(0);
    tstyle.setHeight(1);

    auto fstyle = SkFontStyle(
      context->state->font->weight,
      context->state->font->stretch,
      (SkFontStyle::Slant) context->state->font->style
    );
    tstyle.setFontStyle(fstyle);
    
    if (fill == 1) tstyle.setForegroundColor(*sk_context_fill_paint(context->state));
    else tstyle.setForegroundColor(*sk_context_stroke_paint(context->state));
    
    skia::textlayout::ParagraphStyle paraStyle;
    paraStyle.setTextAlign(skia::textlayout::TextAlign::kLeft);
    paraStyle.setTextStyle(tstyle);
    paraStyle.setTextDirection(skia::textlayout::TextDirection(context->state->direction));
    
    auto builder = skia::textlayout::ParagraphBuilderImpl::make(paraStyle, fontCollection, SkUnicode::Make());
    builder->addText(text, textLen);
    auto paragraph = builder->Build();
    paragraph.get()->layout(100000);

    auto paragraphImpl = static_cast<skia::textlayout::ParagraphImpl *>(paragraph.get());

    std::vector<skia::textlayout::LineMetrics> metrics_vec;
    paragraph->getLineMetrics(metrics_vec);
    if (metrics_vec.size() == 0) return 0;
    
    auto line_metrics = metrics_vec[0];
    auto run = paragraphImpl->run(0);
    auto font = run.font();
    
    SkFontMetrics font_metrics;
    font.getMetrics(&font_metrics);
    
    SkRect bounds[textLen];
    auto glyphs = run.glyphs();
    auto glyphsSize = glyphs.size();
    font.getBounds(glyphs.data(), textLen, &bounds[0], nullptr);
    
    auto textBox = paragraph->getRectsForRange(0, textLen, skia::textlayout::RectHeightStyle::kTight, skia::textlayout::RectWidthStyle::kTight);
    auto lineWidth = 0.0;
    auto firstCharBounds = bounds[0];
    auto descent = firstCharBounds.fBottom;
    auto ascent = firstCharBounds.fTop;
    auto lastCharBounds = bounds[glyphsSize - 1];
    auto lastCharPosX = run.positionX(glyphsSize - 1);
    
    for (auto &box : textBox) {
      lineWidth += box.rect.width();
    }
    
    for (size_t i = 1; i <= glyphsSize - 1; ++i) {
      auto charBounds = bounds[i];
      auto charBottom = charBounds.fBottom;
      if (charBottom > descent) {
        descent = charBottom;
      }
      auto charTop = charBounds.fTop;
      if (charTop < ascent) {
        ascent = charTop;
      }
    }
    
    auto alphaBaseline = paragraph->getAlphabeticBaseline();
    auto cssBaseline = (CssBaseline) alphaBaseline;
    
    SkScalar baselineOffset = 0;
    switch (cssBaseline) {
    case CssBaseline::Top:
      baselineOffset = -alphaBaseline - font_metrics.fAscent;
      break;
    case CssBaseline::Hanging:
      baselineOffset = -alphaBaseline - (font_metrics.fAscent - font_metrics.fDescent) * 80 / 100.0;
      break;
    case CssBaseline::Middle:
      baselineOffset = -paragraph->getHeight() / 2;
      break;
    case CssBaseline::Alphabetic:
      baselineOffset = -alphaBaseline;
      break;
    case CssBaseline::Ideographic:
      baselineOffset = -paragraph->getIdeographicBaseline();
      break;
    case CssBaseline::Bottom:
      baselineOffset = -font_metrics.fStrikeoutPosition;
      break;
    }

    if (out_metrics != nullptr) {
      auto offset = -baselineOffset - alphaBaseline;
      out_metrics->ascent = -ascent + offset;
      out_metrics->descent = descent + offset;
      out_metrics->left = line_metrics.fLeft - firstCharBounds.fLeft;
      out_metrics->right = lastCharPosX + lastCharBounds.fRight - line_metrics.fLeft;
      out_metrics->width = lineWidth;
      out_metrics->font_ascent = -font_metrics.fAscent + offset;
      out_metrics->font_descent = font_metrics.fDescent + offset;
    } else {
      auto line_center = lineWidth / 2.0f;
      float paintX;
      switch (context->state->textAlign) {
      case TextAlign::kLeft:
        paintX = x;
        break;
      case TextAlign::kCenter:
        paintX = x - line_center;
        break;
      case TextAlign::kRight:
        paintX = x - lineWidth;
        break;
      }
      auto needScale = lineWidth > maxWidth;
      if (needScale) {
        context->canvas->save();
        context->canvas->scale(maxWidth / lineWidth, 1.0);
      }
      auto paintY = y + baselineOffset;
      paragraph.get()->paint(context->canvas, paintX, paintY);
      if (needScale) {
        context->canvas->restore();
      }
    }

    return 1;
  }

  void sk_context_fill_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = context->canvas;
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), *sk_context_fill_paint(context->state));
  }

  void sk_context_stroke_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = context->canvas;
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), *sk_context_stroke_paint(context->state));
  }

  void sk_context_draw_image(
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
  ) {
    if (canvas != nullptr) {
      image = canvas->surface->makeImageSnapshot().release();
    }

    SkSamplingOptions options;

    if (context->state->imageSmoothingEnabled && context->state->imageSmoothingQuality != FilterQuality::kNone) {
      switch (context->state->imageSmoothingQuality) {
        case FilterQuality::kLow:
          options = SkSamplingOptions(SkFilterMode::kLinear, SkMipmapMode::kNone);
          break;
        case FilterQuality::kMedium:
          options = SkSamplingOptions(SkFilterMode::kLinear, SkMipmapMode::kNearest);
          break;
        case FilterQuality::kHigh:
          options = SkSamplingOptions(SkCubicResampler{1 / 3.0f, 1 / 3.0f});
          break;
      }
    } else {
      options = SkSamplingOptions(SkFilterMode::kNearest, SkMipmapMode::kNone);
    }

    context->canvas->drawImageRect(
      image,
      SkRect::MakeXYWH(dx, dy, dw, dh),
      SkRect::MakeXYWH(sx, sy, sw, sh),
      options,
      context->state->paint,
      SkCanvas::kFast_SrcRectConstraint
    );
  }

  void sk_context_begin_path(sk_context* context) {
    sk_path_begin(context->path);
  }

  void sk_context_move_to(sk_context* context, float x, float y) {
    sk_path_move_to(context->path, x, y);
  }

  void sk_context_line_to(sk_context* context, float x, float y) {
    sk_path_line_to(context->path, x, y);
  }

  void sk_context_rect(sk_context* context, float x, float y, float width, float height) {
    sk_path_rect(context->path, x, y, width, height);
  }

  void sk_context_arc_to(sk_context* context, float x1, float y1, float x2, float y2, float radius) {
    sk_path_arc_to(context->path, x1, y1, x2, y2, radius);
  }

  void sk_context_arc(sk_context* context, float x, float y, float radius, float startAngle, float endAngle, bool clockwise) {
    sk_path_arc(context->path, x, y, radius, startAngle, endAngle, clockwise);
  }

  void sk_context_ellipse(sk_context* context, float x, float y, float radiusX, float radiusY, float rotation, float startAngle, float endAngle, bool clockwise) {
    sk_path_ellipse(context->path, x, y, radiusX, radiusY, rotation, startAngle, endAngle, clockwise);
  }

  void sk_context_bezier_curve_to(sk_context* context, float cp1x, float cp1y, float cp2x, float cp2y, float x, float y) {
    sk_path_bezier_curve_to(context->path, cp1x, cp1y, cp2x, cp2y, x, y);
  }

  void sk_context_quadratic_curve_to(sk_context* context, float cpx, float cpy, float x, float y) {
    sk_path_quadratic_curve_to(context->path, cpx, cpy, x, y);
  }

  void sk_context_close_path(sk_context* context) {
    context->path->close();
  }

  void sk_context_clip(sk_context* context, SkPath* path, unsigned char rule) {
    if (path == nullptr) path = context->path;
    // Should we clone?
    // path = new SkPath(*path);
    path->setFillType(rule == 1 ? SkPathFillType::kEvenOdd : SkPathFillType::kWinding);
    context->canvas->clipPath(*path);
  }

  void sk_context_fill(sk_context* context, SkPath* path, unsigned char rule) {
    if (path == nullptr) path = context->path;
    auto canvas = context->canvas;
    auto paint = sk_context_fill_paint(context->state);
    path->setFillType(rule == 1 ? SkPathFillType::kEvenOdd : SkPathFillType::kWinding);
    canvas->drawPath(*path, *paint);
  }

  void sk_context_stroke(sk_context* context, SkPath* path) {
    if (path == nullptr) path = context->path;
    auto canvas = context->canvas;
    canvas->drawPath(*path, *sk_context_stroke_paint(context->state));
  }

  float sk_context_get_line_width(sk_context* context) {
    return context->state->paint->getStrokeWidth();
  }

  void sk_context_set_line_width(sk_context* context, float width) {
    context->state->paint->setStrokeWidth(width);
  }

  float sk_context_get_miter_limit(sk_context* context) {
    return context->state->paint->getStrokeMiter();
  }

  void sk_context_set_miter_limit(sk_context* context, float limit) {
    context->state->paint->setStrokeMiter(limit);
  }

  float sk_context_get_global_alpha(sk_context* context) {
    return context->state->paint->getAlpha() / 255.0f;
  }

  void sk_context_set_global_alpha(sk_context* context, float alpha) {
    context->state->paint->setAlpha(alpha * 255);
  }

  void sk_context_translate(sk_context* context, float x, float y) {
    auto s = context->state;
    auto inverse = new SkMatrix();
    inverse->setTranslate(-x, -y);
    context->path->transform(*inverse, SkApplyPerspectiveClip::kYes);
    s->transform->preTranslate(x, y);
    context->canvas->setMatrix(*s->transform);
  }

  void sk_context_rotate(sk_context* context, float angle) {
    auto s = context->state;
    auto inverse = new SkMatrix();
    inverse->setRotate(-DEGREES(angle), 0.0f, 0.0f);
    context->path->transform(*inverse, SkApplyPerspectiveClip::kYes);
    s->transform->preRotate(DEGREES(angle));
    context->canvas->setMatrix(*s->transform);
  }

  void sk_context_scale(sk_context* context, float x, float y) {
    auto s = context->state;
    auto inverse = new SkMatrix();
    inverse->preScale(1.0f / x, 1.0f / y);
    context->path->transform(*inverse, SkApplyPerspectiveClip::kYes);
    s->transform->preScale(x, y);
    context->canvas->setMatrix(*s->transform);
  }

  void sk_context_transform(sk_context* context, float a, float b, float c, float d, float e, float f) {
    auto s = context->state;
    auto ts = new SkMatrix();
    ts->setAll(a, b, e, c, d, f, 0.0f, 0.0f, 1.0f);
    context->path->transform(*ts, SkApplyPerspectiveClip::kYes);
    auto mul = (*ts) * (*s->transform);
    s->transform = &mul;
    context->canvas->setMatrix(mul);
  }

  void sk_context_set_transform(sk_context* context, float a, float b, float c, float d, float e, float f) {
    auto s = context->state;
    auto ts = new SkMatrix();
    ts->setAll(a, b, e, c, d, f, 0.0f, 0.0f, 1.0f);
    s->transform = ts;
    context->canvas->setMatrix(*s->transform);
  }

  void sk_context_reset_transform(sk_context* context) {
    auto s = context->state;
    s->transform->reset();
    context->canvas->setMatrix(*s->transform);
  }

  void sk_context_destroy(sk_context* context) {
    delete context->path;
    delete context->state;
    delete context;
  }
}
