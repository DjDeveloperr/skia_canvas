#include "include/font.hpp"
#include "include/common.hpp"

int systemFontsLoaded = -1;
sk_sp<SkFontMgr> fontMgr = nullptr;
sk_sp<skia::textlayout::FontCollection> fontCollection = nullptr;
sk_sp<skia::textlayout::TypefaceFontProvider> assets = nullptr;

extern "C" {
  SKIA_EXPORT void setup_font_collection() {
    if (fontCollection == nullptr) {
      fontMgr = SkFontMgr::RefDefault();
      fontCollection = sk_sp(new skia::textlayout::FontCollection());
      assets = sk_sp(new skia::textlayout::TypefaceFontProvider());
      fontCollection->setDefaultFontManager(fontMgr);
      fontCollection->setAssetFontManager(assets);
    }
  }

  SKIA_EXPORT int fonts_register_path(const char* path, char* alias) {
    auto tf = fontMgr->makeFromFile(path);
    auto result = assets->registerTypeface(tf);
    if (alias != nullptr) assets->registerTypeface(tf, SkString(alias));
    return (int) result;
  }

  SKIA_EXPORT int fonts_register_memory(const void* data, size_t length, char* alias) {
    auto tf = fontMgr->makeFromData(sk_sp<SkData>(SkData::MakeWithoutCopy(data, length)));
    auto result = assets->registerTypeface(tf);
    if (alias != nullptr) assets->registerTypeface(tf, SkString(alias));
    return (int) result;
  }

  SKIA_EXPORT int fonts_register_dir(char* path) {
    // Recursively register all fonts in a directory
    int count = 0;
    for (std::filesystem::recursive_directory_iterator i(path), end; i != end; ++i) {
      if (!std::filesystem::is_directory(i->path())) {
        auto ext = i->path().extension();
        if (ext == ".ttf" || ext == ".otf" || ext == ".ttc" || ext == ".pfb" || ext == ".woff" || ext == ".woff2") {
          fonts_register_path((const char*) i->path().c_str(), nullptr);
          count++;
        }
      }
    }
    return count;
  }

  SKIA_EXPORT int load_system_fonts() {
    if (systemFontsLoaded == -1) {
      systemFontsLoaded = 0;
      #if defined(__APPLE__)
        systemFontsLoaded = fonts_register_dir("/System/Library/Fonts");
      #endif
      #if defined(__linux__)
        systemFontsLoaded = fonts_register_dir("/usr/share/fonts");
      #endif
      #if defined(_WIN32)
        systemFontsLoaded = fonts_register_dir("C:\\Windows\\Fonts");
      #endif
    }
    return systemFontsLoaded;
  }

  SKIA_EXPORT void fonts_set_alias(char* alias, char* family) {
    auto style = SkFontStyle();
    auto typeface = assets->matchFamilyStyle(family, style);
    assets->registerTypeface(sk_sp(typeface), SkString(alias));
  }

  SKIA_EXPORT int fonts_count() {
    return assets->countFamilies();
  }

  SKIA_EXPORT char* fonts_family(int index) {
    auto family = new SkString();
    assets->getFamilyName(index, family);
    return strdup(family->c_str());
  }
}
