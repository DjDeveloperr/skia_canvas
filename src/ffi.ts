const lib = Deno.dlopen("./native/build/libnative_canvas.so", {
  sk_create_canvas: {
    parameters: ["i32", "i32"],
    result: "pointer",
  },

  sk_destroy_canvas: {
    parameters: ["pointer"],
    result: "void",
  },
} as const).symbols;

export default lib;
