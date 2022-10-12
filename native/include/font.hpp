#pragma once

#include <filesystem>
#include "include/common.hpp"
#include "include/core/SkFont.h"
#include "include/core/SkFontMgr.h"
#include "modules/skparagraph/include/FontCollection.h"
#include "modules/skparagraph/include/TypefaceFontProvider.h"

extern "C" {
  SKIA_EXPORT void setup_font_collection();
  SKIA_EXPORT int fonts_register_path(const char* path, char* alias);
  SKIA_EXPORT int fonts_register_memory(const void* data, size_t length, char* alias);
  SKIA_EXPORT int fonts_register_dir(char* path);
  SKIA_EXPORT int load_system_fonts();
  SKIA_EXPORT void fonts_set_alias(char* alias, char* family);
  SKIA_EXPORT int fonts_count();
  SKIA_EXPORT char* fonts_family(int index);
}
