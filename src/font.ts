import ffi, { cstr, readCstr } from "./ffi.ts";

const {
  fonts_register_dir,
  fonts_register_memory,
  fonts_register_path,
  fonts_set_alias,
  setup_font_collection,
  load_system_fonts,
  fonts_count,
  fonts_family,
} = ffi;

setup_font_collection();
const SYSTEM_FONTS = Deno.env.get("CANVAS_DISABLE_SYSTEM_FONTS") == "1"
  ? 0
  : load_system_fonts();

/**
 * Manage fonts to be used by Skia.
 */
export class Fonts {
  /**
   * At startup we load the system fonts, this property
   * gives the count of system fonts loaded.
   *
   * If you want to disable loading system fonts, set the
   * `CANVAS_DISABLE_SYSTEM_FONTS` environment variable to `1`.
   */
  static get systemFontCount() {
    return SYSTEM_FONTS;
  }

  /**
   * Get number of font families registered.
   */
  static get famliliesCount() {
    return fonts_count();
  }

  /**
   * Get a list of all available font families.
   */
  static get families() {
    const count = fonts_count();
    const families = new Array<string>(count);
    for (let i = 0; i < count; i++) {
      families[i] = readCstr(fonts_family(i));
    }
    return families;
  }

  /**
   * Register all fonts in a directory.
   */
  static registerDir(dir: string) {
    return fonts_register_dir(cstr(dir));
  }

  /** Register a font either from file or in memory buffer */
  static register(path: string): void;
  static register(data: Uint8Array, alias?: string): void;
  static register(path: string | Uint8Array, alias?: string) {
    if (path instanceof Uint8Array) {
      fonts_register_memory(path, path.length, alias ? cstr(alias) : null);
    } else {
      fonts_register_path(cstr(path));
    }
  }

  /**
   * Set alias for a font family.
   */
  static setAlias(alias: string, family: string) {
    fonts_set_alias(cstr(alias), cstr(family));
  }
}
