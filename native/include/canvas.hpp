#pragma once

#include "include/core/SkGraphics.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkSurface.h"
#include "include/core/SkData.h"
#include "include/core/SkImageInfo.h"
#include "include/common.hpp"

typedef struct sk_canvas {
  SkSurface* surface;
  void* pixels;
} sk_canvas;
