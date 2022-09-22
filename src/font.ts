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

export class Fonts {
  static get systemFontCount() {
    return SYSTEM_FONTS;
  }

  static get famliliesCount() {
    return fonts_count();
  }

  static get families() {
    const count = fonts_count();
    const families = new Array<string>(count);
    for (let i = 0; i < count; i++) {
      families[i] = readCstr(fonts_family(i));
    }
    return families;
  }

  static registerDir(dir: string) {
    return fonts_register_dir(cstr(dir));
  }

  static registerPath(path: string) {
    fonts_register_path(cstr(path));
  }

  static registerMemory(data: Uint8Array, alias?: string) {
    fonts_register_memory(data, data.length, alias ? cstr(alias) : null);
  }

  static setAlias(alias: string, family: string) {
    fonts_set_alias(cstr(alias), cstr(family));
  }
}
