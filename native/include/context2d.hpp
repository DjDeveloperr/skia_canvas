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
#include "deps/csscolorparser.hpp"
#include "include/common.hpp"
#include "include/font.hpp"
#include "include/canvas.hpp"
#include "include/path2d.hpp"

typedef struct sk_context_state {
  SkPaint* paint;
  float shadowOffsetX;
  float shadowOffsetY;
  float shadowBlur;
  std::vector<float> lineDash;
  float globalAlpha;
  float lineDashOffset;
  RGBA fillStyle;
  RGBA strokeStyle;
  RGBA shadowColor;
  SkMatrix* transform;
  bool imageSmoothingEnabled;
  FilterQuality imageSmoothingQuality;
  TextAlign textAlign;
  TextBaseline textBaseline;
  TextDirection direction;
  Font* font;
} sk_context_state;

typedef struct sk_context {
  SkCanvas* canvas;
  SkPath* path;
  std::vector<sk_context_state> states;
  sk_context_state* state;
} sk_context;

sk_context_state* create_default_state();
sk_context_state* clone_context_state(sk_context_state* state);
void free_context_state(sk_context_state* state);
