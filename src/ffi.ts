import {
  createDownloadURL,
  dirname,
  dlopen,
  ensureCacheLocation,
  ensureDir,
  extname,
  FetchOptions,
  isFile,
  join,
  urlToFilename,
} from "../deps.ts";
import meta from "../deno.json" assert { type: "json" };

const SYMBOLS = {
  sk_canvas_create: {
    parameters: ["i32", "i32"],
    result: "pointer",
  },

  sk_canvas_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_canvas_save: {
    parameters: ["pointer", "buffer", "i32", "i32"],
    result: "i32",
  },

  sk_canvas_get_context: {
    parameters: ["pointer"],
    result: "pointer",
  },

  sk_context_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_save: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_restore: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_clear_rect: {
    parameters: ["pointer", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_set_fill_style: {
    parameters: ["pointer", "buffer"],
    result: "i32",
  },

  sk_context_fill_rect: {
    parameters: ["pointer", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_stroke_rect: {
    parameters: ["pointer", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_set_stroke_style: {
    parameters: ["pointer", "buffer"],
    result: "i32",
  },

  sk_context_begin_path: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_move_to: {
    parameters: ["pointer", "f32", "f32"],
    result: "void",
  },

  sk_context_line_to: {
    parameters: ["pointer", "f32", "f32"],
    result: "void",
  },

  sk_context_close_path: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_fill: {
    parameters: ["pointer", "pointer", "u8"],
    result: "void",
  },

  sk_context_stroke: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },

  sk_context_get_line_width: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_line_width: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_get_miter_limit: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_miter_limit: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_get_global_alpha: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_global_alpha: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_set_shadow_color: {
    parameters: ["pointer", "buffer"],
    result: "i32",
  },

  sk_context_rect: {
    parameters: ["pointer", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_clip: {
    parameters: ["pointer", "pointer", "u8"],
    result: "void",
  },

  sk_path_create: {
    parameters: [],
    result: "pointer",
  },

  sk_path_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_path_move_to: {
    parameters: ["pointer", "f32", "f32"],
    result: "void",
  },

  sk_path_line_to: {
    parameters: ["pointer", "f32", "f32"],
    result: "void",
  },

  sk_path_close: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_path_rect: {
    parameters: ["pointer", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_path_create_copy: {
    parameters: ["pointer"],
    result: "pointer",
  },

  sk_path_from_svg_string: {
    parameters: ["buffer"],
    result: "pointer",
  },

  sk_path_begin: {
    parameters: ["pointer"],
    result: "pointer",
  },

  sk_path_arc_to: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_path_arc: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32", "u8"],
    result: "void",
  },

  sk_path_ellipse: {
    parameters: [
      "pointer",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "u8",
    ],
    result: "void",
  },

  sk_path_bezier_curve_to: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_path_quadratic_curve_to: {
    parameters: ["pointer", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_arc_to: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_arc: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32", "u8"],
    result: "void",
  },

  sk_context_ellipse: {
    parameters: [
      "pointer",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "u8",
    ],
    result: "void",
  },

  sk_context_bezier_curve_to: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_quadratic_curve_to: {
    parameters: ["pointer", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_translate: {
    parameters: ["pointer", "f32", "f32"],
    result: "void",
  },

  sk_context_rotate: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_scale: {
    parameters: ["pointer", "f32", "f32"],
    result: "void",
  },

  sk_context_transform: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_set_transform: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32", "f32"],
    result: "void",
  },

  sk_context_reset_transform: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_get_line_cap: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_line_cap: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_get_line_dash_offset: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_line_dash_offset: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_get_text_direction: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_text_direction: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_get_text_align: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_text_align: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_get_text_baseline: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_text_baseline: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_get_shadow_blur: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_shadow_blur: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_get_shadow_offset_x: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_shadow_offset_x: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_get_shadow_offset_y: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_shadow_offset_y: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_set_font: {
    parameters: ["pointer", "f32", "buffer", "u32", "i32", "i32", "i32"],
    result: "i32",
  },

  sk_canvas_read_pixels: {
    parameters: ["pointer", "i32", "i32", "i32", "i32", "buffer", "i32"],
    result: "void",
  },

  sk_canvas_encode_image: {
    parameters: ["pointer", "i32", "i32", "buffer", "buffer"],
    result: "pointer",
  },

  sk_data_free: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_draw_image: {
    parameters: [
      "pointer",
      "pointer",
      "pointer",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
    ],
    result: "void",
  },

  sk_image_from_encoded: {
    parameters: ["buffer", "u32"],
    result: "pointer",
  },

  sk_image_from_file: {
    parameters: ["buffer"],
    result: "pointer",
  },

  sk_image_width: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_image_height: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_image_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  setup_font_collection: {
    parameters: [],
    result: "void",
  },

  load_system_fonts: {
    parameters: [],
    result: "i32",
  },

  fonts_register_path: {
    parameters: ["buffer"],
    result: "i32",
  },

  fonts_register_memory: {
    parameters: ["buffer", "u32", "buffer"],
    result: "i32",
  },

  fonts_register_dir: {
    parameters: ["buffer"],
    result: "i32",
  },

  fonts_set_alias: {
    parameters: ["buffer", "buffer"],
    result: "void",
  },

  fonts_count: {
    parameters: [],
    result: "i32",
  },

  fonts_family: {
    parameters: ["i32"],
    result: "pointer",
  },

  sk_context_text: {
    parameters: [
      "pointer",
      "buffer",
      "i32",
      "f32",
      "f32",
      "f32",
      "i32",
      "pointer",
    ],
    result: "i32",
  },

  sk_context_get_line_join: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_line_join: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_set_line_dash: {
    parameters: ["pointer", "buffer", "u32"],
    result: "void",
  },

  sk_context_is_point_in_path: {
    parameters: ["pointer", "f32", "f32", "pointer", "i32"],
    result: "i32",
  },

  sk_context_is_point_in_stroke: {
    parameters: ["pointer", "f32", "f32", "pointer"],
    result: "i32",
  },

  sk_context_get_global_composite_operation: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_global_composite_operation: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_get_image_smoothing_enabled: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_image_smoothing_enabled: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_round_rect: {
    parameters: [
      "pointer",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
    ],
    result: "void",
  },

  sk_path_round_rect: {
    parameters: [
      "pointer",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
    ],
    result: "void",
  },

  sk_context_get_transform: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },

  sk_context_get_image_smoothing_quality: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_context_set_image_smoothing_quality: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_put_image_data: {
    parameters: ["pointer", "i32", "i32", "buffer", "i32", "f32", "f32"],
    result: "void",
  },

  sk_context_put_image_data_dirty: {
    parameters: [
      "pointer",
      "i32",
      "i32",
      "buffer",
      "i32",
      "i32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "f32",
      "i32",
    ],
    result: "void",
  },

  sk_gradient_create_linear: {
    parameters: ["f32", "f32", "f32", "f32"],
    result: "pointer",
  },

  sk_gradient_create_radial: {
    parameters: ["f32", "f32", "f32", "f32", "f32", "f32"],
    result: "pointer",
  },

  sk_gradient_create_conic: {
    parameters: ["f32", "f32", "f32"],
    result: "pointer",
  },

  sk_gradient_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_gradient_add_color_stop: {
    parameters: ["pointer", "f32", "buffer"],
    result: "i32",
  },

  sk_context_set_fill_style_gradient: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },

  sk_context_set_stroke_style_gradient: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },

  sk_init: {
    parameters: [],
    result: "void",
  },

  sk_pattern_new_image: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },

  sk_pattern_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_pattern_set_transform: {
    parameters: ["pointer", "f64", "f64", "f64", "f64", "f64", "f64"],
    result: "void",
  },

  sk_context_set_fill_style_pattern: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },

  sk_context_set_stroke_style_pattern: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },

  sk_context_filter_reset: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_context_filter_blur: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_brightness: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_contrast: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_drop_shadow: {
    parameters: ["pointer", "f32", "f32", "f32", "buffer"],
    result: "i32",
  },

  sk_context_filter_grayscale: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_hue_rotate: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_invert: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_opacity: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_saturated: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_filter_sepia: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_get_letter_spacing: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_letter_spacing: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_get_word_spacing: {
    parameters: ["pointer"],
    result: "f32",
  },

  sk_context_set_word_spacing: {
    parameters: ["pointer", "f32"],
    result: "void",
  },

  sk_context_set_font_stretch: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_context_set_font_variant_caps: {
    parameters: ["pointer", "i32"],
    result: "void",
  },

  sk_pdf_new: {
    parameters: [
      "buffer",
      "buffer",
      "buffer",
      "buffer",
      "buffer",
      "buffer",
      "buffer",
      "buffer",
      "bool",
      "i32",
    ],
    result: "pointer",
  },

  sk_pdf_begin_page: {
    parameters: ["pointer", "f32", "f32", "f32", "f32", "f32", "f32"],
    result: "pointer",
  },

  sk_pdf_end_page: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_pdf_write_file: {
    parameters: ["pointer", "buffer"],
    result: "i32",
  },

  sk_pdf_get_buffer: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "pointer",
  },

  sk_pdf_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_svg_new: {
    parameters: ["i32", "i32", "i32"],
    result: "pointer",
  },

  sk_svg_destroy: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_svg_get_context: {
    parameters: ["pointer"],
    result: "pointer",
  },

  sk_svg_write_file: {
    parameters: ["pointer", "buffer"],
    result: "i32",
  },

  sk_svg_get_buffer: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "pointer",
  },

  sk_canvas_create_gl: {
    parameters: ["i32", "i32"],
    result: "pointer",
  },

  sk_canvas_flush: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_canvas_set_size: {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
  },

  sk_path_is_point_in_path: {
    parameters: ["pointer", "f32", "f32", "i32"],
    result: "i32",
  },

  sk_path_is_point_in_stroke: {
    parameters: ["pointer", "f32", "f32", "f32"],
    result: "i32",
  },

  sk_path_to_svg: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "pointer",
  },

  sk_free_string: {
    parameters: ["pointer"],
    result: "void",
  },

  sk_path_simplify: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_path_as_winding: {
    parameters: ["pointer"],
    result: "i32",
  },

  sk_path_op: {
    parameters: ["pointer", "pointer", "i32"],
    result: "i32",
  },

  sk_path_add_path_buf: {
    name: "sk_path_add_path",
    parameters: ["pointer", "pointer", "buffer"],
    result: "void",
  },

  sk_path_add_path_ptr: {
    name: "sk_path_add_path",
    parameters: ["pointer", "pointer", "pointer"],
    result: "void",
  },
} as const;

const LOCAL_BUILD = Deno.env.get("DENO_SKIA_LOCAL") === "1";
const CUSTOM_PATH = Deno.env.get("DENO_SKIA_PATH");

let lib!: Deno.DynamicLibrary<typeof SYMBOLS>["symbols"];

if (LOCAL_BUILD) {
  lib = Deno.dlopen(
    new URL(
      `../native/build/${
        Deno.build.os === "windows" ? "Release/" : "lib"
      }native_canvas.${
        Deno.build.os === "darwin"
          ? "dylib"
          : Deno.build.os === "windows"
          ? "dll"
          : "so"
      }`,
      import.meta.url,
    ),
    SYMBOLS,
  ).symbols;
} else if (CUSTOM_PATH) {
  lib = Deno.dlopen(CUSTOM_PATH, SYMBOLS).symbols;
} else {
  const name = "native_canvas";
  const url = `${meta.github}/releases/download/${meta.verision}`;
  const options: FetchOptions = {
    url: {
      darwin: {
        aarch64: `${url}/lib${name}_aarch64.dylib`,
        x86_64: `${url}/lib${name}.dylib`,
      },
      linux: `${url}/lib${name}.so`,
      windows: `${url}/${name}.dll`,
    },
  };

  // For some reason we have to keep icudtl.dat in the same directory as the
  // dynamic library. Only on Windows.
  if (Deno.build.os === "windows") {
    const durl = createDownloadURL(options);
    const directory = await ensureCacheLocation();
    const cacheBasePath = join(directory, await urlToFilename(durl));
    const cacheIcuBasePath = join(directory, `https/github.com`);
    const cacheIcuPath = join(cacheIcuBasePath, `icudtl.dat`);
    const cacheFilePath = `${cacheBasePath}${extname(durl.pathname)}`;
    const cached = await isFile(cacheFilePath);

    if (!cached) {
      const response = await fetch(`${url}/icudtl.dat`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Could not find ${url}`);
        } else {
          throw new Deno.errors.Http(
            `${response.status} ${response.statusText}`,
          );
        }
      }

      await ensureDir(dirname(cacheIcuBasePath));
      try {
        await Deno.mkdir(cacheIcuBasePath, { recursive: true });
      } catch (_) {
        // ignore if already exists
      }
      await Deno.writeFile(
        cacheIcuPath,
        new Uint8Array(await response.arrayBuffer()),
      );
    }

    await ensureDir(dirname(cacheBasePath));
  }

  lib = (await dlopen(options, SYMBOLS)).symbols;
}

lib.sk_init();

export default lib;

const {
  op_ffi_cstr_read,
  op_ffi_get_buf,
  op_base64_encode,
  op_base64_decode,
}: {
  op_ffi_cstr_read: (ptr: Deno.PointerValue) => string;
  op_ffi_get_buf: (
    ptr: Deno.PointerValue,
    offset: number,
    size: number,
  ) => ArrayBuffer;
  op_base64_encode: (buf: Uint8Array) => string;
  op_base64_decode: (base64: string) => Uint8Array;
} = (Deno as any)[(Deno as any).internal].core.ops;

export function cstr(str: string) {
  return new TextEncoder().encode(str + "\0");
}

export {
  op_base64_decode as decodeBase64,
  op_base64_encode as encodeBase64,
  op_ffi_cstr_read as readCstr,
  op_ffi_get_buf as getBuffer,
};
