#include "include/context2d.hpp"

#ifndef _USE_MATH_DEFINES
#define _USE_MATH_DEFINES
#include <math.h>
#endif

extern sk_sp<skia::textlayout::FontCollection> fontCollection;

sk_context_state* create_default_state() {
  sk_context_state* state = new sk_context_state();
  state->paint = new SkPaint();
  state->paint->setAntiAlias(true);
  state->shadowOffsetX = 0;
  state->shadowOffsetY = 0;
  state->shadowBlur = 0;
  state->lineDash = std::vector<float>();
  state->globalAlpha = 1;
  state->lineDashOffset = 0;
  state->fillStyle = Style();
  state->fillStyle.type = kStyleColor;
  state->fillStyle.color = { 0, 0, 0, 255 };
  state->strokeStyle = Style();
  state->strokeStyle.type = kStyleColor;
  state->strokeStyle.color = { 0, 0, 0, 255 };
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
  if (state->fillStyle.shader) state->fillStyle.shader.~sk_sp();
  if (state->strokeStyle.shader) state->strokeStyle.shader.~sk_sp();
  delete state->paint;
  delete state->transform;
  free(state->font);
  delete state;
}

// Utility

SkPaint* sk_context_fill_paint(sk_context_state* state) {
  SkPaint* paint = new SkPaint(*state->paint);
  paint->setStyle(SkPaint::kFill_Style);
  if (state->fillStyle.type == kStyleColor) {
    auto color = state->fillStyle.color;
    paint->setColor(SkColorSetARGB(color.a, color.r, color.g, color.b));
  } else if (state->fillStyle.type == kStyleShader) {
    paint->setColor(SkColorSetARGB(paint->getAlpha(), 0, 0, 0));
    paint->setShader(state->fillStyle.shader);
  }
  if (!state->lineDash.empty()) {
    auto effect = SkDashPathEffect::Make(
      state->lineDash.data(),
      state->lineDash.size(),
      state->lineDashOffset
    );
    paint->setPathEffect(effect);
  }
  return paint;
}

SkPaint* sk_context_stroke_paint(sk_context_state* state) {
  SkPaint* paint = new SkPaint(*state->paint);
  paint->setStyle(SkPaint::kStroke_Style);
  if (state->strokeStyle.type == kStyleColor) {
    auto color = state->strokeStyle.color;
    paint->setColor(SkColorSetARGB(color.a, color.r, color.g, color.b));
  } else if (state->strokeStyle.type == kStyleShader) {
    paint->setColor(SkColorSetARGB(paint->getAlpha(), 0, 0, 0));
    paint->setShader(state->strokeStyle.shader);
  }
  if (!state->lineDash.empty()) {
    auto effect = SkDashPathEffect::Make(
      state->lineDash.data(),
      state->lineDash.size(),
      state->lineDashOffset
    );
    paint->setPathEffect(effect);
  }
  return paint;
}

SkPaint* sk_context_drop_shadow_paint(sk_context* context, SkPaint* paint) {
  auto alpha = paint->getAlpha();
  auto lastState = context->state;
  auto shadowColor = lastState->shadowColor;
  auto shadowAlpha = shadowColor.a;
  shadowAlpha = (uint8_t)((((float) shadowAlpha) * ((float) alpha)) / 255);
  if (shadowAlpha == 0) return nullptr;
  if (lastState->shadowBlur == 0 && lastState->shadowOffsetX == 0 && lastState->shadowOffsetY == 0) return nullptr;
  auto result = new SkPaint(*paint);
  auto a = shadowColor.a;
  auto r = shadowColor.r;
  auto g = shadowColor.g;
  auto b = shadowColor.b;
  auto ts = lastState->transform;
  auto sigX = lastState->shadowBlur / (2.0f * ts->getScaleX());
  auto sigY = lastState->shadowBlur / (2.0f * ts->getScaleY());
  auto shadowEffect = SkImageFilters::DropShadowOnly(
    lastState->shadowOffsetX,
    lastState->shadowOffsetY,
    sigX,
    sigY,
    SkColorSetARGB(a, r, g, b),
    nullptr
  );
  result->setAlpha(shadowAlpha);
  result->setImageFilter(shadowEffect);
  return result;
}

RGBA multiplyByAlpha(RGBA* color, uint8_t globalAlpha) {
  auto result = *color;
  auto r_a_f = ((float) result.a) / 255.0f;
  auto g_a_f = ((float) globalAlpha) / 255.0f;
  result.a = (uint8_t)((std::max(0.0f, std::min(r_a_f * g_a_f, 1.0f)) * 255.0f));
  return result;
}

SkPaint* sk_context_shadow_blur_paint(sk_context* context, SkPaint* paint) {
  auto alpha = paint->getAlpha();
  auto lastState = context->state;
  auto shadowColor = multiplyByAlpha(&lastState->shadowColor, alpha);
  auto shadowAlpha = shadowColor.a;
  if (shadowAlpha == 0) return nullptr;
  if (lastState->shadowBlur == 0 && lastState->shadowOffsetX == 0 && lastState->shadowOffsetY == 0) return nullptr;
  auto result = new SkPaint(*paint);
  auto a = shadowColor.a;
  auto r = shadowColor.r;
  auto g = shadowColor.g;
  auto b = shadowColor.b;
  auto ts = lastState->transform;
  auto sigX = lastState->shadowBlur / (2.0f * ts->getScaleX());
  auto sigY = lastState->shadowBlur / (2.0f * ts->getScaleY());
  auto shadowEffect = SkImageFilters::DropShadow(
    0.0f,
    0.0f,
    sigX,
    sigY,
    SkColorSetARGB(a, r, g, b),
    nullptr
  );
  result->setAlpha(shadowAlpha);
  result->setImageFilter(shadowEffect);
  auto blurEffect = SkMaskFilter::MakeBlur(SkBlurStyle::kNormal_SkBlurStyle, lastState->shadowBlur / 2.0f, false);
  result->setMaskFilter(blurEffect);
  return result;
}

void applyShadowOffsetMatrix(sk_context* context) {
  auto canvas = context->canvas;
  auto shadowOffsetX = context->state->shadowOffsetX;
  auto shadowOffsetY = context->state->shadowOffsetY;
  auto cts = canvas->getTotalMatrix();
  SkMatrix invert = SkMatrix::I();
  cts.invert(&invert);
  canvas->concat(invert);
  auto shadowOffset = new SkMatrix(cts);
  shadowOffset->preTranslate(shadowOffsetX, shadowOffsetY);
  canvas->concat(*shadowOffset);
  canvas->concat(cts);
}

extern "C" {
  /// Drawing rectangles

  // Context.clearRect()
  void sk_context_clear_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = context->canvas;
    SkPaint paint;
    paint.setARGB(0, 0, 0, 0);
    paint.setStyle(SkPaint::kFill_Style);
    paint.setStrokeMiter(10.0f);
    paint.setBlendMode(SkBlendMode::kClear);
    canvas->drawRect(SkRect::MakeXYWH(x, y, width, height), paint);
  }

  // Context.fillRect()
  void sk_context_fill_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = context->canvas;
    auto rect = SkRect::MakeXYWH(x, y, width, height);
    auto fillPaint = sk_context_fill_paint(context->state);
    auto shadowPaint = sk_context_shadow_blur_paint(context, fillPaint);
    if (shadowPaint != nullptr) {
      canvas->save();
      applyShadowOffsetMatrix(context);
      canvas->drawRect(rect, *shadowPaint);
      canvas->restore();
    }
    canvas->drawRect(rect, *fillPaint);
  }

  // Context.strokeRect()
  void sk_context_stroke_rect(sk_context* context, float x, float y, float width, float height) {
    auto canvas = context->canvas;
    auto rect = SkRect::MakeXYWH(x, y, width, height);
    auto strokePaint = sk_context_stroke_paint(context->state);
    auto shadowPaint = sk_context_shadow_blur_paint(context, strokePaint);
    if (shadowPaint != nullptr) {
      canvas->save();
      applyShadowOffsetMatrix(context);
      canvas->drawRect(rect, *shadowPaint);
      canvas->restore();
    }
    canvas->drawRect(rect, *strokePaint);
  }

  /// Drawing text

  // Helper function to fill/stroke/measure
  int sk_context_text_base(sk_context* context,
    char* text,
    int textLen,
    float x,
    float y,
    float maxWidth,
    int fill,
    sk_line_metrics* out_metrics,
    SkPaint* paint
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
    tstyle.setForegroundColor(*paint);
    
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
    
    SkRect* bounds = (SkRect*) malloc(sizeof(SkRect) * textLen);
    auto glyphs = run.glyphs();
    auto glyphsSize = glyphs.size();
    font.getBounds(glyphs.data(), textLen, &bounds[0], nullptr);
    
    auto textBox = paragraph->getRectsForRange(0, textLen, skia::textlayout::RectHeightStyle::kTight, skia::textlayout::RectWidthStyle::kTight);
    double lineWidth = 0.0;
    SkRect firstCharBounds = bounds[0];
    SkScalar descent = firstCharBounds.fBottom;
    SkScalar ascent = firstCharBounds.fTop;
    SkRect lastCharBounds = bounds[glyphsSize - 1];
    float lastCharPosX = run.positionX(glyphsSize - 1);
    
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

    free(bounds);
    return 1;
  }

  int sk_context_text(sk_context* context,
    char* text,
    int textLen,
    float x,
    float y,
    float maxWidth,
    int fill,
    sk_line_metrics* out_metrics
  ) {
    auto paint = fill == 1 ? sk_context_fill_paint(context->state) : sk_context_stroke_paint(context->state);
    if (out_metrics == nullptr) {
      auto shadowPaint = sk_context_shadow_blur_paint(context, paint);
      if (shadowPaint != nullptr) {
        context->canvas->save();
        applyShadowOffsetMatrix(context);
        auto res = sk_context_text_base(
          context,
          text,
          textLen,
          x,
          y,
          maxWidth,
          fill,
          nullptr,
          shadowPaint
        );
        context->canvas->restore();
        if (res == 0) return 0;
      }
    }
    return sk_context_text_base(
      context,
      text,
      textLen,
      x,
      y,
      maxWidth,
      fill,
      out_metrics,
      paint
    );
  }

  // Context.fillText() implementation in JS using sk_context_test
  // Context.strokeText() implementation in JS using sk_context_test
  // Context.measureText() implementation in JS using sk_context_test

  /// Line styles

  // Context.lineWidth getter
  float sk_context_get_line_width(sk_context* context) {
    return context->state->paint->getStrokeWidth();
  }

  // Context.lineWidth setter
  void sk_context_set_line_width(sk_context* context, float width) {
    context->state->paint->setStrokeWidth(width);
  }

  // Context.lineCap getter
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

  // Context.lineCap setter
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

  // Context.lineJoin getter
  int sk_context_get_line_join(sk_context* context) {
    auto join = context->state->paint->getStrokeJoin();
    switch (join) {
      case SkPaint::kMiter_Join:
        return 0;
      case SkPaint::kRound_Join:
        return 1;
      case SkPaint::kBevel_Join:
        return 2;
    }
  }

  // Context.lineJoin setter
  void sk_context_set_line_join(sk_context* context, int join) {
    switch (join) {
      case 0:
        context->state->paint->setStrokeJoin(SkPaint::kMiter_Join);
        break;
      case 1:
        context->state->paint->setStrokeJoin(SkPaint::kRound_Join);
        break;
      case 2:
        context->state->paint->setStrokeJoin(SkPaint::kBevel_Join);
        break;
    }
  }

  // Context.miterLimit getter
  float sk_context_get_miter_limit(sk_context* context) {
    return context->state->paint->getStrokeMiter();
  }

  // Context.miterLimit setter
  void sk_context_set_miter_limit(sk_context* context, float limit) {
    context->state->paint->setStrokeMiter(limit);
  }

  // Context.getLineDash() value is cached in JS side

  // Context.setLineDash()
  void sk_context_set_line_dash(sk_context* context, float* dash, int count) {
    context->state->lineDash = std::vector<float>(dash, dash + count);
  }

  // Context.lineDashOffset getter
  float sk_context_get_line_dash_offset(sk_context* context) {
    return context->state->lineDashOffset;
  }

  // Context.lineDashOffset setter
  void sk_context_set_line_dash_offset(sk_context* context, float offset) {
    context->state->lineDashOffset = offset;
  }

  /// Text styles

  // Context.font getter value is cached in JS side

  // Context.font setter (Font string parsed in JS side)
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

  // Context.textAlign getter
  int sk_context_get_text_align(sk_context* context) {
    return context->state->textAlign;
  }

  // Context.textAlign setter
  void sk_context_set_text_align(sk_context* context, int align) {
    context->state->textAlign = TextAlign(align);
  }

  // Context.textBaseline getter
  int sk_context_get_text_baseline(sk_context* context) {
    return context->state->textBaseline;
  }

  // Context.textBaseline setter
  void sk_context_set_text_baseline(sk_context* context, int baseline) {
    context->state->textBaseline = TextBaseline(baseline);
  }

  // Context.direction getter
  int sk_context_get_text_direction(sk_context* context) {
    return context->state->direction;
  }

  // Context.direction setter
  void sk_context_set_text_direction(sk_context* context, int direction) {
    context->state->direction = TextDirection(direction);
  }

  // TODO: Context.letterSpacing
  // TODO: Context.fontKerning
  // TODO: Context.fontStretch
  // TODO: Context.fontVariantCaps
  // TODO: Context.textRendering
  // TODO: Context.wordSpacing

  /// Fill and stroke styles

  // Context.fillStyle getter value is cached in JS side

  // Context.fillStyle setter
  int sk_context_set_fill_style(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->fillStyle = Style();
      context->state->fillStyle.type = kStyleColor;
      context->state->fillStyle.color = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      return 1;
    }
    return 0;
  }

  void sk_context_set_fill_style_gradient(sk_context* context, sk_gradient* gradient) {
    context->state->fillStyle = Style();
    context->state->fillStyle.type = kStyleShader;
    context->state->fillStyle.shader = sk_gradient_to_shader(gradient, context->state->transform);
  }

  void sk_context_set_fill_style_pattern(sk_context* context, sk_pattern* pattern) {
    context->state->fillStyle = Style();
    context->state->fillStyle.type = kStyleShader;
    context->state->fillStyle.shader = sk_pattern_to_shader(pattern);
  }

  // Context.strokeStyle getter value is cached in JS side

  // Context.strokeStyle setter
  int sk_context_set_stroke_style(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->strokeStyle = Style();
      context->state->strokeStyle.type = kStyleColor;
      context->state->strokeStyle.color = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      return 1;
    }
    return 0;
  }

  void sk_context_set_stroke_style_gradient(sk_context* context, sk_gradient* gradient) {
    context->state->strokeStyle = Style();
    context->state->strokeStyle.type = kStyleShader;
    context->state->strokeStyle.shader = sk_gradient_to_shader(gradient, context->state->transform);
  }

  void sk_context_set_stroke_style_pattern(sk_context* context, sk_pattern* pattern) {
    context->state->strokeStyle = Style();
    context->state->strokeStyle.type = kStyleShader;
    context->state->strokeStyle.shader = sk_pattern_to_shader(pattern);
  }

  /// Gradients and patterns

  // Implemented in gradient.cpp
  // Context.createConicGradient()
  // Context.createLinearGradient()
  // Context.createRadialGradient()

  // Implemented in pattern.cpp
  // Context.createPattern()

  /// Shadows

  // Context.shadowBlur getter
  float sk_context_get_shadow_blur(sk_context* context) {
    return context->state->shadowBlur;
  }

  // Context.shadowBlur setter
  void sk_context_set_shadow_blur(sk_context* context, float blur) {
    context->state->shadowBlur = blur;
  }

  // Context.shadowColor getter value is cached in JS side

  // Context.shadowColor setter
  int sk_context_set_shadow_color(sk_context* context, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      context->state->shadowColor = {val.r, val.g, val.b, (uint8_t)(val.a * 255)};
      return 1;
    }
    return 0;
  }

  // Context.shadowOffsetX getter
  float sk_context_get_shadow_offset_x(sk_context* context) {
    return context->state->shadowOffsetX;
  }

  // Context.shadowOffsetX setter
  void sk_context_set_shadow_offset_x(sk_context* context, float x) {
    context->state->shadowOffsetX = x;
  }

  // Context.shadowOffsetY getter
  float sk_context_get_shadow_offset_y(sk_context* context) {
    return context->state->shadowOffsetY;
  }

  // Context.shadowOffsetY setter
  void sk_context_set_shadow_offset_y(sk_context* context, float y) {
    context->state->shadowOffsetY = y;
  }

  /// Paths

  // Context.beginPath()
  void sk_context_begin_path(sk_context* context) {
    sk_path_begin(context->path);
  }

  // Context.closePath()
  void sk_context_close_path(sk_context* context) {
    context->path->close();
  }

  // Context.moveTo()
  void sk_context_move_to(sk_context* context, float x, float y) {
    sk_path_move_to(context->path, x, y);
  }

  // Context.lineTo()
  void sk_context_line_to(sk_context* context, float x, float y) {
    sk_path_line_to(context->path, x, y);
  }

  // Context.bezierCurveTo()
  void sk_context_bezier_curve_to(sk_context* context, float cp1x, float cp1y, float cp2x, float cp2y, float x, float y) {
    sk_path_bezier_curve_to(context->path, cp1x, cp1y, cp2x, cp2y, x, y);
  }

  // Context.quadraticCurveTo()
  void sk_context_quadratic_curve_to(sk_context* context, float cpx, float cpy, float x, float y) {
    sk_path_quadratic_curve_to(context->path, cpx, cpy, x, y);
  }
  
  // Context.arc()
  void sk_context_arc(sk_context* context, float x, float y, float radius, float startAngle, float endAngle, bool clockwise) {
    sk_path_arc(context->path, x, y, radius, startAngle, endAngle, clockwise);
  }

  // Context.arcTo()
  void sk_context_arc_to(sk_context* context, float x1, float y1, float x2, float y2, float radius) {
    sk_path_arc_to(context->path, x1, y1, x2, y2, radius);
  }

  // Context.ellipse()
  void sk_context_ellipse(sk_context* context, float x, float y, float radiusX, float radiusY, float rotation, float startAngle, float endAngle, bool clockwise) {
    sk_path_ellipse(context->path, x, y, radiusX, radiusY, rotation, startAngle, endAngle, clockwise);
  }

  // Context.rect()
  void sk_context_rect(sk_context* context, float x, float y, float width, float height) {
    sk_path_rect(context->path, x, y, width, height);
  }

  // Context.roundRect()
  void sk_context_round_rect(sk_context* context, float x, float y, float width, float height, float tl, float tr, float br, float bl) {
    sk_path_round_rect(context->path, x, y, width, height, tl, tr, br, bl);
  }

  /// Drawing paths

  // Context.fill()
  void sk_context_fill(sk_context* context, SkPath* path, unsigned char rule) {
    if (path == nullptr) path = context->path;
    auto canvas = context->canvas;
    auto paint = sk_context_fill_paint(context->state);
    path->setFillType(rule == 1 ? SkPathFillType::kEvenOdd : SkPathFillType::kWinding);
    auto shadowPaint = sk_context_shadow_blur_paint(context, paint);
    if (shadowPaint != nullptr) {
      canvas->save();
      applyShadowOffsetMatrix(context);
      canvas->drawPath(*path, *shadowPaint);
      canvas->restore();
    }
    canvas->drawPath(*path, *paint);
  }

  // Context.stroke()
  void sk_context_stroke(sk_context* context, SkPath* path) {
    if (path == nullptr) path = context->path;
    auto canvas = context->canvas;
    auto strokePaint = sk_context_stroke_paint(context->state);
    auto shadowPaint = sk_context_shadow_blur_paint(context, strokePaint);
    if (shadowPaint != nullptr) {
      canvas->save();
      applyShadowOffsetMatrix(context);
      canvas->drawPath(*path, *shadowPaint);
      canvas->restore();
    }
    canvas->drawPath(*path, *strokePaint);
  }

  // TODO?: Context.drawFocusIfNeeded() (should we support it?)
  // TODO?: Context.scrollPathIntoView() (should we support it?)

  // Context.clip()
  void sk_context_clip(sk_context* context, SkPath* path, unsigned char rule) {
    if (path == nullptr) path = context->path;
    // TODO?: Should we clone?
    // path = new SkPath(*path);
    path->setFillType(rule == 1 ? SkPathFillType::kEvenOdd : SkPathFillType::kWinding);
    context->canvas->clipPath(*path);
  }

  // Context.isPointInPath()
  int sk_context_is_point_in_path(sk_context* context, float x, float y, SkPath* path, int rule) {
    if (path == nullptr) path = context->path;
    path->setFillType(rule == 1 ? SkPathFillType::kEvenOdd : SkPathFillType::kWinding);
    return (int) path->contains(x, y);
  }

  // Context.isPointInStroke()
  int sk_context_is_point_in_stroke(sk_context* context, float x, float y, SkPath* path) {
    if (path == nullptr) path = context->path;
    return (int) path->contains(x, y);
  }

  /// Transformations

  // Context.getTransform()
  void sk_context_get_transform(sk_context* context, float* m) {
    auto matrix = context->state->transform;
    m[0] = matrix->getScaleX();
    m[1] = matrix->getSkewY();
    m[2] = matrix->getSkewX();
    m[3] = matrix->getScaleY();
    m[4] = matrix->getTranslateX();
    m[5] = matrix->getTranslateY();
  }

  // Context.rotate()
  void sk_context_rotate(sk_context* context, float angle) {
    auto s = context->state;
    auto inverse = new SkMatrix();
    inverse->setRotate(-DEGREES(angle), 0.0f, 0.0f);
    context->path->transform(*inverse, SkApplyPerspectiveClip::kYes);
    s->transform->preRotate(DEGREES(angle));
    context->canvas->setMatrix(*s->transform);
  }

  // Context.scale()
  void sk_context_scale(sk_context* context, float x, float y) {
    auto s = context->state;
    auto inverse = new SkMatrix();
    inverse->preScale(1.0f / x, 1.0f / y);
    context->path->transform(*inverse, SkApplyPerspectiveClip::kYes);
    s->transform->preScale(x, y);
    context->canvas->setMatrix(*s->transform);
  }

  // Context.translate()
  void sk_context_translate(sk_context* context, float x, float y) {
    auto s = context->state;
    auto inverse = new SkMatrix();
    inverse->setTranslate(-x, -y);
    context->path->transform(*inverse, SkApplyPerspectiveClip::kYes);
    s->transform->preTranslate(x, y);
    context->canvas->setMatrix(*s->transform);
  }

  // Context.transform()
  void sk_context_transform(sk_context* context, float a, float b, float c, float d, float e, float f) {
    auto s = context->state;
    auto ts = new SkMatrix();
    ts->setAll(a, b, e, c, d, f, 0.0f, 0.0f, 1.0f);
    context->path->transform(*ts, SkApplyPerspectiveClip::kYes);
    auto mul = (*ts) * (*s->transform);
    s->transform = &mul;
    context->canvas->setMatrix(mul);
  }

  // Context.setTransform()
  void sk_context_set_transform(sk_context* context, float a, float b, float c, float d, float e, float f) {
    auto s = context->state;
    auto ts = new SkMatrix();
    ts->setAll(a, b, e, c, d, f, 0.0f, 0.0f, 1.0f);
    s->transform = ts;
    context->canvas->setMatrix(*s->transform);
  }

  // Context.resetTransform()
  void sk_context_reset_transform(sk_context* context) {
    auto s = context->state;
    s->transform->reset();
    context->canvas->setMatrix(*s->transform);
  }

  /// Compositing

  // Context.globalAlpha getter
  float sk_context_get_global_alpha(sk_context* context) {
    return context->state->paint->getAlpha() / 255.0f;
  }

  // Context.globalAlpha setter
  void sk_context_set_global_alpha(sk_context* context, float alpha) {
    context->state->paint->setAlpha(alpha * 255);
  }

  // Context.globalCompositeOperation getter
  int sk_context_get_global_composite_operation(sk_context* context) {
    switch (context->state->paint->getBlendMode_or(SkBlendMode::kSrcOver)) {
      case SkBlendMode::kSrcOver: return 0;
      case SkBlendMode::kSrcIn: return 1;
      case SkBlendMode::kSrcOut: return 2;
      case SkBlendMode::kSrcATop: return 3;
      case SkBlendMode::kDstOver: return 4;
      case SkBlendMode::kDstIn: return 5;
      case SkBlendMode::kDstOut: return 6;
      case SkBlendMode::kDstATop: return 7;
      case SkBlendMode::kXor: return 8;
      case SkBlendMode::kPlus: return 9;
      case SkBlendMode::kModulate: return 10;
      case SkBlendMode::kScreen: return 11;
      case SkBlendMode::kOverlay: return 12;
      case SkBlendMode::kDarken: return 13;
      case SkBlendMode::kLighten: return 14;
      case SkBlendMode::kColorDodge: return 15;
      case SkBlendMode::kColorBurn: return 16;
      case SkBlendMode::kHardLight: return 17;
      case SkBlendMode::kSoftLight: return 18;
      case SkBlendMode::kDifference: return 19;
      case SkBlendMode::kExclusion: return 20;
      case SkBlendMode::kMultiply: return 21;
      case SkBlendMode::kHue: return 22;
      case SkBlendMode::kSaturation: return 23;
      case SkBlendMode::kColor: return 24;
      case SkBlendMode::kLuminosity: return 25;
      default: return 0;
    }
  }

  // Context.globalCompositeOperation setter
  void sk_context_set_global_composite_operation(sk_context* context, unsigned char op) {
    switch (op) {
      case 0: context->state->paint->setBlendMode(SkBlendMode::kSrcOver); break;
      case 1: context->state->paint->setBlendMode(SkBlendMode::kSrcIn); break;
      case 2: context->state->paint->setBlendMode(SkBlendMode::kSrcOut); break;
      case 3: context->state->paint->setBlendMode(SkBlendMode::kSrcATop); break;
      case 4: context->state->paint->setBlendMode(SkBlendMode::kDstOver); break;
      case 5: context->state->paint->setBlendMode(SkBlendMode::kDstIn); break;
      case 6: context->state->paint->setBlendMode(SkBlendMode::kDstOut); break;
      case 7: context->state->paint->setBlendMode(SkBlendMode::kDstATop); break;
      case 8: context->state->paint->setBlendMode(SkBlendMode::kXor); break;
      case 9: context->state->paint->setBlendMode(SkBlendMode::kPlus); break;
      case 10: context->state->paint->setBlendMode(SkBlendMode::kModulate); break;
      case 11: context->state->paint->setBlendMode(SkBlendMode::kScreen); break;
      case 12: context->state->paint->setBlendMode(SkBlendMode::kOverlay); break;
      case 13: context->state->paint->setBlendMode(SkBlendMode::kDarken); break;
      case 14: context->state->paint->setBlendMode(SkBlendMode::kLighten); break;
      case 15: context->state->paint->setBlendMode(SkBlendMode::kColorDodge); break;
      case 16: context->state->paint->setBlendMode(SkBlendMode::kColorBurn); break;
      case 17: context->state->paint->setBlendMode(SkBlendMode::kHardLight); break;
      case 18: context->state->paint->setBlendMode(SkBlendMode::kSoftLight); break;
      case 19: context->state->paint->setBlendMode(SkBlendMode::kDifference); break;
      case 20: context->state->paint->setBlendMode(SkBlendMode::kExclusion); break;
      case 21: context->state->paint->setBlendMode(SkBlendMode::kMultiply); break;
      case 22: context->state->paint->setBlendMode(SkBlendMode::kHue); break;
      case 23: context->state->paint->setBlendMode(SkBlendMode::kSaturation); break;
      case 24: context->state->paint->setBlendMode(SkBlendMode::kColor); break;
      case 25: context->state->paint->setBlendMode(SkBlendMode::kLuminosity); break;
      default: context->state->paint->setBlendMode(SkBlendMode::kSrcOver); break;
    }
  }

  /// Drawing images

  // Context.drawImage()
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
        default:
          options = SkSamplingOptions(SkFilterMode::kLinear, SkMipmapMode::kNone);
          break;
      }
    } else {
      options = SkSamplingOptions(SkFilterMode::kNearest, SkMipmapMode::kNone);
    }

    auto srcrect = SkRect::MakeXYWH(sx, sy, sw, sh);
    auto dstrect = SkRect::MakeXYWH(dx, dy, dw, dh);

    auto shadowPaint = sk_context_drop_shadow_paint(context, context->state->paint);
    if (shadowPaint != nullptr) {
      context->canvas->drawImageRect(
        image,
        dstrect,
        srcrect,
        options,
        shadowPaint,
        SkCanvas::kFast_SrcRectConstraint
      );
    }

    context->canvas->drawImageRect(
      image,
      dstrect,
      srcrect,
      options,
      context->state->paint,
      SkCanvas::kFast_SrcRectConstraint
    );
  }

  /// Pixel manipulation

  // Context.createImageData() implemented in JS
  
  // Context.getImageData() implemented in JS
  
  // Context.putImageData()

  void sk_context_put_image_data(sk_context* context, int width, int height, uint8_t *pixels, int row_bytes, float x, float y) {
    SkImageInfo info = SkImageInfo::Make(width, height, SkColorType::kRGBA_8888_SkColorType, SkAlphaType::kUnpremul_SkAlphaType);
    context->canvas->writePixels(info, pixels, row_bytes, x, y);
  }

  void sk_context_put_image_data_dirty(sk_context* context, int width, int height, uint8_t *pixels, int row_bytes, int length, float x, float y, float dirty_x, float dirty_y, float dirty_width, float dirty_height, uint8_t cs) {
    SkImageInfo info = SkImageInfo::Make(width, height, SkColorType::kRGBA_8888_SkColorType, SkAlphaType::kUnpremul_SkAlphaType, cs == 0 ? SkColorSpace::MakeSRGB() : SkColorSpace::MakeRGB(SkNamedTransferFn::kSRGB, SkNamedGamut::kDisplayP3));
    sk_sp<SkData> data = SkData::MakeFromMalloc(pixels, length);
    sk_sp<SkImage> image = SkImage::MakeRasterData(info, data, row_bytes);
    context->canvas->drawImageRect(
      image,
      SkRect::MakeXYWH(dirty_x, dirty_y, dirty_width, dirty_height),
      SkRect::MakeXYWH(x + dirty_x, y + dirty_y, dirty_width, dirty_height),
      SkSamplingOptions(SkCubicResampler::Mitchell()),
      nullptr,
      SkCanvas::kFast_SrcRectConstraint
    );
    // JS manages the memory of the pixels array
    data.release();
  }

  /// Image smoothing

  // Context.imageSmoothingEnabled getter
  int sk_context_get_image_smoothing_enabled(sk_context* context) {
    return (int) context->state->imageSmoothingEnabled;
  }

  // Context.imageSmoothingEnabled setter
  void sk_context_set_image_smoothing_enabled(sk_context* context, int enabled) {
    context->state->imageSmoothingEnabled = enabled == 1;
  }

  // Context.imageSmoothingQuality getter
  int sk_context_get_image_smoothing_quality(sk_context* context) {
    return (int) context->state->imageSmoothingQuality;
  }

  // Context.imageSmoothingQuality setter
  void sk_context_set_image_smoothing_quality(sk_context* context, int quality) {
    context->state->imageSmoothingQuality = (FilterQuality) quality;
  }

  /// The canvas state

  // Context.save()
  void sk_context_save(sk_context* context) {
    context->states.push_back(*clone_context_state(context->state));
    context->canvas->save();
  }

  // Context.restore()
  void sk_context_restore(sk_context* context) {
    if (context->states.size() > 0) {
      free_context_state(context->state);
      context->state = &context->states.back();
      context->states.pop_back();
      context->canvas->restore();
    }
  }

  // Context.canvas getter implemented in JS side
  // Context.getContextAttributes() stubbed in JS
  // Context.reset() stubbed in JS
  // Context.isContextLost() stubbed in JS

  /// Filters
  
  // TODO: Context.filter

  /// CONTEXT_FINALIZER callback
  void sk_context_destroy(sk_context* context) {
    delete context->path;
    delete context->state;
    delete context;
  }
}
