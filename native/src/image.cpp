#include "include/image.hpp"

extern "C" {
  SkImage* sk_image_from_encoded(void* data, size_t length) {
    auto skData = SkData::MakeFromMalloc(data, length);
    SkImage* image = SkImage::MakeFromEncoded(skData).release();
    skData.release();
    return image;
  }

  SkImage* sk_image_from_file(char* path) {
    FILE* file = fopen(path, "rb");
    fseek(file, 0, SEEK_END);
    size_t length = ftell(file);
    fseek(file, 0, SEEK_SET);
    void* data = malloc(length);
    fread(data, 1, length, file);
    fclose(file);
    return sk_image_from_encoded(data, length);
  }

  int sk_image_width(SkImage* image) {
    return image->width();
  }

  int sk_image_height(SkImage* image) {
    return image->height();
  }

  void sk_image_destroy(SkImage* image) {
    image->unref();
  }
}
