import ffi, { cstr, decodeBase64 } from "./ffi.ts";

const {
  sk_image_destroy,
  sk_image_from_encoded,
  sk_image_from_file,
  sk_image_height,
  sk_image_width,
} = ffi;

const SK_IMAGE_FINALIZER = new FinalizationRegistry(
  (image: Deno.PointerValue) => {
    sk_image_destroy(image);
  },
);

export type ImageSource = Uint8Array | string;

const _token = Symbol("[[token]]");
const _ptr = Symbol("[[ptr]]");
const _src = Symbol("[[src]]");

export class Image extends EventTarget {
  [_token]: { ptr: Deno.PointerValue } = { ptr: null };
  [_ptr]: Deno.PointerValue = null;
  [_src]?: ImageSource;

  get _unsafePointer(): Deno.PointerValue {
    return this[_ptr];
  }

  constructor(data?: ImageSource) {
    super();
    this.src = data;
  }

  get src(): ImageSource | undefined {
    return this[_src];
  }

  set src(data: ImageSource | undefined) {
    if (this[_ptr] !== null) {
      sk_image_destroy(this[_ptr]);
      SK_IMAGE_FINALIZER.unregister(this[_token]);
      this[_ptr] = null;
    }

    if (data === undefined) {
      this[_src] = undefined;
      this[_ptr] = null;
      this[_token].ptr = null;
      return;
    }

    if (typeof data === "string") {
      if (data.match(/^\s*https?:\/\//)) {
        fetch(data.trim())
          .then((res) => res.arrayBuffer())
          .then((buffer) => {
            this.src = new Uint8Array(buffer);
          })
          .catch((error) => {
            this.dispatchEvent(
              new ErrorEvent("error", {
                error,
              }),
            );
          });
        return;
      } else if (data.match(/^\s*data:/)) {
        const comma = data.indexOf(",");
        const isBase64 = data.lastIndexOf("base64", comma) !== -1;
        const content = data.slice(comma + 1);
        const buffer = isBase64
          ? decodeBase64(content)
          : new TextEncoder().encode(content);
        this.src = buffer;
        return;
      }
    }

    this[_ptr] = data instanceof Uint8Array
      ? sk_image_from_encoded(data, data.byteLength)
      : sk_image_from_file(cstr(data));

    if (this[_ptr] === null) {
      const error = new Error("Failed to load image");
      queueMicrotask(() => {
        this.dispatchEvent(
          new ErrorEvent("error", {
            error,
          }),
        );
      });
      throw error;
    }

    this[_token].ptr = this[_ptr];
    this[_src] = data;

    if (this[_ptr] !== null) {
      SK_IMAGE_FINALIZER.register(this, this[_ptr], this[_token]);
    }

    queueMicrotask(() => {
      this.dispatchEvent(new Event("load"));
    });
  }

  #onload?: EventListenerOrEventListenerObject;
  #onerror?: EventListenerOrEventListenerObject;

  get onload(): EventListenerOrEventListenerObject | undefined {
    return this.#onload;
  }

  get onerror(): EventListenerOrEventListenerObject | undefined {
    return this.#onerror;
  }

  // deno-lint-ignore adjacent-overload-signatures
  set onload(fn: EventListenerOrEventListenerObject | undefined) {
    if (this.#onload) {
      this.removeEventListener("load", this.#onload);
    }
    this.#onload = fn;
    if (fn) this.addEventListener("load", fn);
  }

  // deno-lint-ignore adjacent-overload-signatures
  set onerror(fn: EventListenerOrEventListenerObject | undefined) {
    if (this.#onerror) {
      this.removeEventListener("error", this.#onerror);
    }
    this.#onerror = fn;
    if (fn) this.addEventListener("error", fn);
  }

  static async load(path: string | URL): Promise<Image> {
    const data = path instanceof URL || path.startsWith("http")
      ? await fetch(path).then((e) => e.arrayBuffer()).then((e) =>
        new Uint8Array(e)
      )
      : await Deno.readFile(path);
    return new Image(data);
  }

  /**
   * Load an image from a local file synchronously.
   */
  static loadSync(path: string): Image {
    const data = Deno.readFileSync(path);
    return new Image(data);
  }

  get width(): number {
    if (this._unsafePointer === null) return 0;
    return sk_image_width(this[_ptr]);
  }

  get height(): number {
    if (this._unsafePointer === null) return 0;
    return sk_image_height(this[_ptr]);
  }

  [Symbol.for("Deno.customInspect")](): string {
    if (this._unsafePointer === null) {
      return `Image { pending, src: ${Deno.inspect(this.src)} }`;
    }
    return `Image { width: ${this.width}, height: ${this.height} }`;
  }
}

export type ColorSpace = "srgb" | "rec2020" | "display-p3";

export interface ImageDataSettings {
  colorSpace?: ColorSpace;
}

export class ImageData {
  #width: number;
  #height: number;
  #data: Uint8ClampedArray;
  #colorSpace: ColorSpace;

  constructor(width: number, height: number, settings?: ImageDataSettings);
  constructor(
    dataArray: Uint8ClampedArray | Uint8Array,
    width: number,
    height?: number,
    settings?: ImageDataSettings,
  );
  constructor(
    width: number | Uint8ClampedArray | Uint8Array,
    height: number | ImageDataSettings,
    settings?: ImageDataSettings | number,
    settings2?: ImageDataSettings,
  ) {
    if (typeof width === "number") {
      this.#width = width;
      this.#height = height as number;
      this.#data = new Uint8ClampedArray(width * (height as number) * 4);
      this.#colorSpace = (settings as ImageDataSettings)?.colorSpace ?? "srgb";
    } else {
      this.#data = new Uint8ClampedArray(width.buffer);
      this.#width = height as number;
      this.#height = settings ? settings as number : this.#data.length / 4;
      this.#colorSpace = settings2?.colorSpace ?? "srgb";
    }
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  get data(): Uint8ClampedArray {
    return this.#data;
  }

  get colorSpace(): ColorSpace {
    return this.#colorSpace;
  }
}
