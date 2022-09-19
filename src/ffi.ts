const lib = Deno.dlopen(
  "./native/build/libnative_canvas.so",
  {
    sk_create_canvas: {
      parameters: ["i32", "i32"],
      result: "pointer",
    },

    sk_destroy_canvas: {
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

    sk_destroy_context: {
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
