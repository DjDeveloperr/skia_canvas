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

export class Image extends EventTarget {
  #token: { ptr: Deno.PointerValue } = { ptr: 0 };
  #ptr: Deno.PointerValue = 0;
  #src?: ImageSource;

  get _unsafePointer() {
    return this.#ptr;
  }

  constructor(data?: ImageSource) {
    super();
    this.src = data;
  }

  get src() {
    return this.#src;
  }

  set src(data: ImageSource | undefined) {
    if (this.#ptr !== 0) {
      sk_image_destroy(this.#ptr);
      SK_IMAGE_FINALIZER.unregister(this.#token);
      this.#ptr = 0;
    }

    if (data === undefined) {
      this.#src = undefined;
      this.#ptr = 0;
      this.#token.ptr = 0;
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

    this.#ptr = data instanceof Uint8Array
      ? sk_image_from_encoded(data, data.byteLength)
      : sk_image_from_file(cstr(data));

    if (this.#ptr === 0) {
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

    this.#token.ptr = this.#ptr;
    this.#src = data;

    if (this.#ptr !== 0) {
      SK_IMAGE_FINALIZER.register(this, this.#ptr, this.#token);
    }

    queueMicrotask(() => {
      this.dispatchEvent(new Event("load"));
    });
  }

  #onload?: EventListenerOrEventListenerObject;
  #onerror?: EventListenerOrEventListenerObject;

  get onload() {
    return this.#onload;
  }

  get onerror() {
    return this.#onerror;
  }

  set onload(fn: EventListenerOrEventListenerObject | undefined) {
    if (this.#onload) {
      this.removeEventListener("load", this.#onload);
    }
    this.#onload = fn;
    if (fn) this.addEventListener("load", fn);
  }

  set onerror(fn: EventListenerOrEventListenerObject | undefined) {
    if (this.#onerror) {
      this.removeEventListener("error", this.#onerror);
    }
    this.#onerror = fn;
    if (fn) this.addEventListener("error", fn);
  }

  static async load(path: string | URL) {
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
  static loadSync(path: string) {
    const data = Deno.readFileSync(path);
    return new Image(data);
  }

  get width() {
    if (this._unsafePointer === 0) return 0;
    return sk_image_width(this.#ptr);
  }

  get height() {
    if (this._unsafePointer === 0) return 0;
    return sk_image_height(this.#ptr);
  }

  [Symbol.for("Deno.customInspect")]() {
    if (this._unsafePointer === 0) {
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

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get data() {
    return this.#data;
  }

  get colorSpace() {
    return this.#colorSpace;
  }
}
