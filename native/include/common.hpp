#pragma once

#ifndef _USE_MATH_DEFINES
#define _USE_MATH_DEFINES
#include <math.h>
#endif

#include "include/core/SkEncodedImageFormat.h"

#ifndef SKIA_EXPORT
  #if defined(_WIN32)
    #define SKIA_EXPORT __declspec(dllexport)
  #else
    #define SKIA_EXPORT
  #endif
#endif

typedef struct RGBA {
  uint8_t r;
  uint8_t g;
  uint8_t b;
  uint8_t a;
} RGBA;

typedef struct Style {
  unsigned char type;
  RGBA color;
} Style;

enum TextAlign {
  kLeft,
  kCenter,
  kRight
};

enum TextBaseline {
  kTop,
  kMiddle,
  kBottom
};

enum TextDirection {
  kLTR,
  kRTL
};

enum class CssBaseline
{
  Top,
  Hanging,
  Middle,
  Alphabetic,
  Ideographic,
  Bottom,
};

enum FilterQuality {
  kNone,
  kLow,
  kMedium,
  kHigh
};

enum FontStyle {
  kNormalStyle,
  kItalic,
  kOblique
};

enum FontVariant {
  kNormalVariant,
  kSmallCaps
};

enum FontStretch {
  kUltraCondensed = 1,
  kExtraCondensed,
  kCondensed,
  kSemiCondensed,
  kNormal,
  kSemiExpanded,
  kExpanded,
  kExtraExpanded,
  kUltraExpanded
};

typedef struct Font {
  float size;
  char* family;
  uint32_t weight;
  FontStyle style;
  FontVariant variant;
  FontStretch stretch;
} Font;

typedef struct sk_line_metrics {
  float ascent;
  float descent;
  float left;
  float right;
  float width;
  float font_ascent;
  float font_descent;
} sk_line_metrics;

#define DEGREES(radians) ((radians) * 180.0 / M_PI)
#define ALMOST_EQUAL(a, b) (fabs((a) - (b)) < 0.00001)

SkEncodedImageFormat format_from_int(int format);
