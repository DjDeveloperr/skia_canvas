import { CanvasRenderingContext2D } from "./context2d.ts";
import ffi, { cstr, getBuffer } from "./ffi.ts";

const {
  sk_pdf_begin_page,
  sk_pdf_destroy,
  sk_pdf_new,
  sk_pdf_get_buffer,
  sk_pdf_write_file,
  sk_pdf_end_page,
  sk_data_free,
} = ffi;

const PDF_DOCUMENT_FINALIZER = new FinalizationRegistry(
  (ptr: Deno.PointerValue) => {
    sk_pdf_destroy(ptr);
  },
);

const SK_DATA_FINALIZER = new FinalizationRegistry(
  (ptr: Deno.PointerValue) => {
    sk_data_free(ptr);
  },
);

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creation?: Date;
  modified?: Date;
  pdfa?: boolean;
  encodingQuality?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DATE_TIME_SIZE = 2 + 2 + 1 + 1 + 1 + 1 + 1 + 1;

const OUT_SIZE = new Uint32Array(1);
const OUT_SIZE_PTR = new Uint8Array(OUT_SIZE.buffer);
const OUT_DATA = new BigUint64Array(1);
const OUT_DATA_PTR = new Uint8Array(OUT_DATA.buffer);

function dateToSkTime(date: Date) {
  const buffer = new Uint8Array(DATE_TIME_SIZE);
  const view = new DataView(buffer.buffer);
  view.setUint16(2, date.getUTCFullYear(), true);
  view.setUint8(4, date.getUTCMonth() + 1);
  view.setUint8(5, date.getUTCDay());
  return buffer;
}

export class PdfRenderingContext2D extends CanvasRenderingContext2D {
  // @ts-expect-error
  declare canvas!: PdfDocument;

  constructor(
    canvas: PdfDocument,
    ptr: Deno.PointerValue,
    public width: number,
    public height: number,
  ) {
    super(canvas as any, ptr);
  }
}

/**
 * Create a new PDF document to draw using Canvas 2D API.
 */
export class PdfDocument {
  #ptr: Deno.PointerValue;

  constructor(options: PdfMetadata = {}) {
    this.#ptr = sk_pdf_new(
      cstr(options.title ?? ""),
      cstr(options.author ?? ""),
      cstr(options.subject ?? ""),
      cstr(options.keywords ?? ""),
      cstr(options.creator ?? ""),
      cstr(options.producer ?? ""),
      options.creation
        ? dateToSkTime(options.creation)
        : new Uint8Array(DATE_TIME_SIZE),
      options.modified
        ? dateToSkTime(options.modified)
        : new Uint8Array(DATE_TIME_SIZE),
      options.pdfa ?? false,
      options.encodingQuality ?? 0,
    );
    PDF_DOCUMENT_FINALIZER.register(this, this.#ptr);
  }

  /**
   * Creates a new page and returns a 2D rendering context for drawing on it.
   * The context extends CanvasRenderingContext2D so it has same API.
   *
   * You must not use the context after calling endPage.
   */
  newPage(w: number, h: number, contentRect?: Rect) {
    const ptr = sk_pdf_begin_page(
      this.#ptr,
      w,
      h,
      ...(contentRect
        ? [contentRect.x, contentRect.y, contentRect.w, contentRect.h]
        : [0, 0, w, h]) as [number, number, number, number],
    );
    if (!ptr) {
      throw new Error("Failed to create new page");
    }
    return new PdfRenderingContext2D(this, ptr, w, h);
  }

  /** Writes the page into internal stream and destroys  */
  endPage() {
    sk_pdf_end_page(this.#ptr);
  }

  /** Saves PDF to the file and closes the stream. Changes cannot be made to PDF after this. */
  save(path: string) {
    if (!sk_pdf_write_file(this.#ptr, cstr(path))) {
      throw new Error("Failed to save PDF");
    }
  }

  /** Encodes the PDF into a buffer and closes the stream. Changes cannot be made to PDF after this. */
  encode() {
    const skdata = sk_pdf_get_buffer(this.#ptr, OUT_DATA_PTR, OUT_SIZE_PTR);
    if (!skdata) {
      throw new Error("Failed to encode PDF");
    }
    const size = OUT_SIZE[0];
    const ptr = OUT_DATA[0];
    const buffer = new Uint8Array(getBuffer(ptr, size));
    SK_DATA_FINALIZER.register(buffer, skdata);
    return buffer;
  }
}
