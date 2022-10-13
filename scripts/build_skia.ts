const BUILD_ARGS: Record<string, any> = {
  is_official_build: false,
  skia_use_system_harfbuzz: false,
  werror: false,
  skia_use_system_libpng: false,
  skia_use_system_libwebp: false,
  skia_use_system_zlib: false,
  skia_use_system_icu: false,
  skia_use_system_expat: false,
  skia_use_system_libjpeg_turbo: false,
  extra_cflags_cc: Deno.build.os === "windows" ? `[]` : `["-Ofast"]`,
  skia_use_lua: false,
  skia_use_piex: false,
  is_debug: false,
  is_component_build: false,
  skia_enable_gpu: false,
  skia_use_gl: false,
  // skia_use_harfbuzz: true,
  skia_use_icu: true,
  skia_use_libjpeg_turbo_decode: true,
  skia_use_libjpeg_turbo_encode: true,
  skia_use_libheif: true,
  skia_use_libwebp_decode: true,
  skia_use_libwebp_encode: true,
  skia_use_freetype: true,
  skia_use_freetype_woff2: true,
  skia_use_fontconfig: false,
  skia_use_x11: false,
  skia_enable_skottie: false,
  skia_enable_tools: false,
  skia_use_sfntly: false,
  skia_use_system_freetype2: false,
  paragraph_gms_enabled: false,
  paragraph_tests_enabled: false,
  skia_enable_android_utils: false,
  skia_enable_discrete_gpu: false,
  skia_enable_particles: true,
  skia_enable_pdf: true,
  skia_enable_skshaper: true,
  skia_enable_svg: true,
  skia_enable_skparagraph: true,
  skia_enable_sktext: true,
  skia_pdf_subset_harfbuzz: true,
  skia_use_expat: true,
  skia_use_wuffs: true,
  skia_use_libgifcodec: true,
};

if (Deno.args.includes("ccache")) {
  BUILD_ARGS["cc_wrapper"] = `"ccache"`;
}

Deno.chdir(new URL("../skia", import.meta.url));

const $ = (cmd: string | URL, ...args: string[]) => {
  console.log(`%c$ ${cmd.toString()} ${args.join(" ")}`, "color: #888");
  Deno.spawnSync(cmd, {
    args,
    cwd: new URL("../skia", import.meta.url),
    stdin: "null",
    stdout: "inherit",
    stderr: "inherit",
  });
};

if (!Deno.args.includes("fast")) $("python", "./tools/git-sync-deps");

if (Deno.build.os === "windows") {
  const SkLoadICU = new URL("../skia/third_party/icu/SkLoadICU.cpp", import.meta.url);
  const original = Deno.readTextFileSync(SkLoadICU);
  Deno.writeTextFileSync(
    SkLoadICU,
    original.replace(
      `load_from(executable_directory()) || load_from(library_directory());`,
      `load_from(library_directory()) || load_from(executable_directory());`,
    ),
  );
  window.onunload = () => {
    Deno.writeTextFileSync(SkLoadICU, original);
  };
}

$(
  new URL("../skia/bin/gn", import.meta.url),
  "gen",
  "out/Release",
  "--args=" + Object.entries(BUILD_ARGS).map(([k, v]) => `${k}=${v}`).join(" "),
);

$("ninja", "-j 24", "-C", "out/Release");
