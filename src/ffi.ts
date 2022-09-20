const lib = Deno.dlopen(
  "./native/build/libnative_canvas.so",
  {
    sk_canvas_create: {
      parameters: ["i32", "i32"],
      result: "pointer",
    },

    sk_canvas_destroy: {
      parameters: ["pointer"],
      result: "void",
    },

    sk_canvas_save: {
      parameters: ["pointer", "buffer"],
      result: "u8",
    },

    sk_create_context: {
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

    sk_context_get_fill_style: {
      parameters: ["pointer"],
      result: "pointer",
    },

    sk_context_set_fill_style: {
      parameters: ["pointer", "buffer"],
      result: "void",
    },

    sk_context_fill_rect: {
      parameters: ["pointer", "f32", "f32", "f32", "f32"],
      result: "void",
    },

    sk_context_stroke_rect: {
      parameters: ["pointer", "f32", "f32", "f32", "f32"],
      result: "void",
    },

    sk_context_get_stroke_style: {
      parameters: ["pointer"],
      result: "pointer",
    },

    sk_context_set_stroke_style: {
      parameters: ["pointer", "buffer"],
      result: "void",
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
      parameters: ["pointer"],
      result: "void",
    },

    sk_context_stroke: {
      parameters: ["pointer"],
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

    sk_context_get_shadow_color: {
      parameters: ["pointer"],
      result: "pointer",
    },

    sk_context_set_shadow_color: {
      parameters: ["pointer", "buffer"],
      result: "void",
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
  } as const,
).symbols;

export default lib;

const { op_ffi_cstr_read }: {
  op_ffi_cstr_read: (ptr: Deno.PointerValue) => string;
} = (Deno as any).core.ops;

export function cstr(str: string) {
  return new TextEncoder().encode(str + "\0");
}

export { op_ffi_cstr_read as readCstr };
