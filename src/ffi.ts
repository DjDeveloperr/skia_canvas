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
  } as const,
).symbols;

export default lib;

export function cstr(str: string) {
  return new TextEncoder().encode(str + "\0");
}
