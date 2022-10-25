#include "include/common.hpp"
#include "include/context2d.hpp"
#include "include/docs/SkPDFDocument.h"

typedef struct sk_pdf_document {
  SkDynamicMemoryWStream* stream;
  SkDocument* pdf;
} sk_pdf_document;

extern "C" {
  SKIA_EXPORT sk_pdf_document* sk_pdf_new(
    char* title,
    char* author,
    char* subject,
    char* keywords,
    char* creator,
    char* producer,
    SkTime::DateTime creation,
    SkTime::DateTime modified,
    bool pdfa,
    int encodingQuality
  );

  SKIA_EXPORT sk_context* sk_pdf_begin_page(
    sk_pdf_document* doc,
    float width,
    float height,
    float x,
    float y,
    float w,
    float h
  );

  SKIA_EXPORT void sk_pdf_end_page(sk_pdf_document* doc);

  SKIA_EXPORT int sk_pdf_write_file(sk_pdf_document* doc, char* path);

  SKIA_EXPORT SkData* sk_pdf_get_buffer(sk_pdf_document* doc, void** buffer, unsigned int* size);

  SKIA_EXPORT void sk_pdf_destroy(sk_pdf_document* doc);
}
