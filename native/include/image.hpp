#pragma once

#include <filesystem>
#include "include/common.hpp"
#include "include/core/SkImage.h"
#include "include/core/SkData.h"

extern "C" {
  SKIA_EXPORT SkImage* sk_image_from_encoded(void* data, size_t length);
  SKIA_EXPORT SkImage* sk_image_from_file(char* path);
  SKIA_EXPORT int sk_image_width(SkImage* image);
  SKIA_EXPORT int sk_image_height(SkImage* image);
  SKIA_EXPORT void sk_image_destroy(SkImage* image);
}
