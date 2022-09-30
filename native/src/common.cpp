#include "include/common.hpp"

SkEncodedImageFormat format_from_int(int format) {
  switch (format) {
    case 0:
      return SkEncodedImageFormat::kPNG;
    case 1:
      return SkEncodedImageFormat::kJPEG;
    case 2:
      return SkEncodedImageFormat::kWEBP;
  }
}
