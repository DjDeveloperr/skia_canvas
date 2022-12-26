const BUILD_ARGS: Record<string, any> = {
  cc: Deno.build.os === "windows" ? '"clang-cl"' : '"clang"',
  cxx: Deno.build.os === "windows" ? '"clang-cl"' : '"clang++"',
  is_official_build: false,
  skia_use_system_harfbuzz: false,
  werror: false,
  skia_use_system_libpng: false,
  skia_use_system_libwebp: false,
  skia_use_system_zlib: false,
  skia_use_system_icu: false,
  skia_use_system_expat: false,
  skia_use_system_libjpeg_turbo: false,
  skia_use_lua: false,
  skia_use_piex: false,
  is_debug: false,
  is_component_build: false,
  skia_enable_gpu: true,
  skia_use_gl: true,
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
  skia_use_x11: Deno.build.os === "linux",
  skia_enable_skottie: false,
  skia_enable_tools: false,
  skia_use_sfntly: false,
  skia_use_system_freetype2: false,
  paragraph_gms_enabled: false,
  paragraph_tests_enabled: false,
  skia_enable_android_utils: false,
  skia_enable_discrete_gpu: true,
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

BUILD_ARGS["extra_cflags_cc"] = "[";

if (Deno.build.os === "windows") {
  BUILD_ARGS["clang_win"] = '"C:\\\\Program Files\\\\LLVM"';

  BUILD_ARGS["extra_cflags_cc"] += '"/std:c++17",' +
    '"/MT",' +
    '"-DSK_FORCE_RASTER_PIPELINE_BLITTER",' +
    '"-DSK_ENABLE_SVG",' +
    '"-DSK_RELEASE",' +
    '"-DSK_DISABLE_TRACING",' +
    '"-DSK_ENCODE_WEBP",' +
    '"-DSK_CODEC_DECODES_WEBP",' +
    '"-DSK_ENCODE_PNG",' +
    '"-DSK_CODEC_DECODES_PNG",' +
    '"-DSK_ENCODE_JPEG",' +
    '"-DSK_CODEC_DECODES_JPEG",' +
    '"-DSK_HAS_HEIF_LIBRARY",' +
    '"-DSK_SHAPER_HARFBUZZ_AVAILABLE"';
} else {
  BUILD_ARGS["extra_cflags_cc"] += '"-std=c++17",' +
    '"-fno-exceptions",' +
    '"-DSK_FORCE_RASTER_PIPELINE_BLITTER",' +
    '"-DSK_ENABLE_SVG",' +
    '"-DSK_RELEASE",' +
    '"-DSK_DISABLE_TRACING",' +
    '"-DSK_ENCODE_WEBP",' +
    '"-DSK_CODEC_DECODES_WEBP",' +
    '"-DSK_ENCODE_PNG",' +
    '"-DSK_CODEC_DECODES_PNG",' +
    '"-DSK_ENCODE_JPEG",' +
    '"-DSK_CODEC_DECODES_JPEG",' +
    '"-DSK_HAS_HEIF_LIBRARY",' +
    '"-DSK_SHAPER_HARFBUZZ_AVAILABLE"';

  const targetArm64 = Deno.env.get("TARGET_ARM64") === "1";
  const m1 = Deno.build.os === "darwin" && Deno.build.arch === "aarch64";
  if (m1 || targetArm64) {
    BUILD_ARGS["target_cpu"] = `"arm64"`;
    BUILD_ARGS["target_os"] = `"mac"`;
    BUILD_ARGS["extra_cflags_cc"] += ', "--target=arm64-apple-macos"';
    BUILD_ARGS["extra_ldflags"] = '["--target=arm64-apple-macos"]';
    BUILD_ARGS["extra_asmflags"] = '["--target=arm64-apple-macos"]';
    BUILD_ARGS["extra_cflags"] = '["--target=arm64-apple-macos"]';
    BUILD_ARGS["extra_cflags_c"] = '["--target=arm64-apple-macos"]';
  }
}

BUILD_ARGS["extra_cflags_cc"] += "]";

Deno.chdir(new URL("../skia", import.meta.url));

const SLICE_WIN = Deno.build.os === "windows" ? 1 : 0;

const $ = (cmd: string | URL, ...args: string[]) => {
  console.log(`%c$ ${cmd.toString()} ${args.join(" ")}`, "color: #888");
  const c = typeof cmd === "string" ? cmd : cmd.pathname.slice(SLICE_WIN);
  new Deno.Command(c, {
    args,
    cwd: new URL("../skia", import.meta.url),
    stdin: "null",
    stdout: "inherit",
    stderr: "inherit",
  }).outputSync();
};

if (!Deno.args.includes("skip-sync-deps")) {
  $(
    Deno.build.os === "windows" ? "python" : "python3",
    "./tools/git-sync-deps",
  );
}

if (Deno.build.os === "windows") {
  const SkLoadICU = new URL(
    "../skia/third_party/icu/SkLoadICU.cpp",
    import.meta.url,
  );
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
