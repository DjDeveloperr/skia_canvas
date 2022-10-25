#include "include/pdfdocument.hpp"

extern "C" {
  sk_pdf_document* sk_pdf_new(
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
  ) {
    sk_pdf_document* doc = new sk_pdf_document();
    doc->stream = new SkDynamicMemoryWStream();
    SkPDF::Metadata metadata;
    metadata.fTitle = SkString(title);
    metadata.fAuthor = SkString(author);
    metadata.fSubject = SkString(subject);
    metadata.fKeywords = SkString(keywords);
    metadata.fCreator = SkString(creator);
    metadata.fProducer = SkString(producer);
    metadata.fCreation = creation;
    metadata.fModified = modified;
    metadata.fPDFA = pdfa;
    metadata.fEncodingQuality = encodingQuality;
    doc->pdf = SkPDF::MakeDocument(doc->stream, metadata).release();
    return doc;
  }

  sk_context* sk_pdf_begin_page(
    sk_pdf_document* doc,
    float width,
    float height,
    float x,
    float y,
    float w,
    float h
  ) {
    sk_context* ctx = new sk_context();
    auto rect = SkRect::MakeXYWH(x, y, w, h);
    ctx->canvas = doc->pdf->beginPage(width, height, &rect);
    ctx->path = new SkPath();
    ctx->state = create_default_state();
    ctx->states = std::vector<sk_context_state>();
    return ctx;
  }

  void sk_pdf_end_page(sk_pdf_document* doc) {
    doc->pdf->endPage();
  }

  int sk_pdf_write_file(sk_pdf_document* doc, char* path) {
    doc->pdf->close();
    SkFILEWStream stream(path);
    return doc->stream->writeToStream(&stream);
  }

  SkData* sk_pdf_get_buffer(sk_pdf_document* doc, void** buffer, unsigned int* size) {
    doc->pdf->close();
    auto data = doc->stream->detachAsData().release();
    *buffer = (void*) data->data();
    *size = data->size();
    return data;
  }

  void sk_pdf_destroy(sk_pdf_document* doc) {
    delete doc->stream;
    doc->pdf->unref();
    delete doc;
  }
}
