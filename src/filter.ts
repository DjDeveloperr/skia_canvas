export enum FilterType {
  Blur,
  Brightness,
  Contrast,
  DropShadow,
  Grayscale,
  HueRotate,
  Invert,
  Opacity,
  Saturate,
  Sepia,
}

interface FilterBase {
  type: FilterType;
}

interface BlurFilter extends FilterBase {
  type: FilterType.Blur;
  value: number;
}

interface BrightnessFilter extends FilterBase {
  type: FilterType.Brightness;
  value: number;
}

interface ContrastFilter extends FilterBase {
  type: FilterType.Contrast;
  value: number;
}

interface DropShadowFilter extends FilterBase {
  type: FilterType.DropShadow;
  dx: number;
  dy: number;
  radius: number;
  color: string;
}

interface GrayscaleFilter extends FilterBase {
  type: FilterType.Grayscale;
  value: number;
}

interface HueRotateFilter extends FilterBase {
  type: FilterType.HueRotate;
  value: number;
}

interface InvertFilter extends FilterBase {
  type: FilterType.Invert;
  value: number;
}

interface OpacityFilter extends FilterBase {
  type: FilterType.Opacity;
  value: number;
}

interface SaturateFilter extends FilterBase {
  type: FilterType.Saturate;
  value: number;
}

interface SepiaFilter extends FilterBase {
  type: FilterType.Sepia;
  value: number;
}

export type Filter =
  | BlurFilter
  | BrightnessFilter
  | ContrastFilter
  | DropShadowFilter
  | GrayscaleFilter
  | HueRotateFilter
  | InvertFilter
  | OpacityFilter
  | SaturateFilter
  | SepiaFilter;

const FILTER_NAMES = [
  "blur",
  "brightness",
  "contrast",
  "drop-shadow",
  "grayscale",
  "hue-rotate",
  "invert",
  "opacity",
  "saturate",
  "sepia",
];

export function parseFilterString(filter: string): Filter[] {
  const filters: Filter[] = [];

  let state: "fn" | "args" = "fn";
  let fn = "";
  let argc = 0;
  let argv: any[] = [];

  let i = 0;
  while (i < filter.length) {
    let ch = filter[i];
    if (state === "fn") {
      if (ch === "(") {
        if (!FILTER_NAMES.includes(fn.toLowerCase())) {
          throw new Error(`Invalid filter name: ${fn}`);
        }
        fn = fn.toLowerCase();
        state = "args";
      } else if (ch.match(/[a-zA-Z0-9\-]+/)) {
        fn += ch;
      } else if (ch.match(/\s/) && fn.length > 0) {
        throw new Error(`Unexpected whitespace in filter function`);
      } else if (!ch.match(/\s/)) {
        throw new Error(`Unexpected character in filter function: ${ch}`);
      }
    } else if (state === "args") {
      if (argc === 1 && fn !== "drop-shadow") {
        throw new Error(`Function ${fn} only takes one argument`);
      } else if (argc === 4 && fn === "drop-shadow") {
        throw new Error(`Function ${fn} only takes four arguments`);
      }

      let arg = "";
      while (ch !== ")" && ch !== "," && ch !== " ") {
        arg += ch;
        i++;
        ch = filter[i];
      }

      if (arg === "" && ch === " ") {
        i++;
        continue;
      }

      function parsePixel() {
        let numPart = "";
        let unitPart = "";
        for (let j = 0; j < arg.length; j++) {
          const ch = arg[j];
          if (ch === " ") continue;
          if (
            (ch.match(/[0-9]/) || (ch === "." && !numPart.includes("."))) &&
            !unitPart
          ) {
            numPart += ch;
          } else {
            unitPart += ch;
          }
        }
        const num = parseFloat(numPart);
        if (unitPart === "px") {
          return num;
        } else if (unitPart === "%") {
          return num * 16 / 100;
        } else if (
          unitPart === "em" || unitPart === "rem" || unitPart === "pc"
        ) {
          return num * 16;
        } else if (unitPart === "pt") {
          return num * 4 / 3;
        } else if (unitPart === "") {
          if (num === 0) {
            return 0;
          } else {
            throw new Error(`Invalid unitless number: ${num} in ${arg}`);
          }
        } else if (unitPart === "in") {
          return num * 96;
        } else if (unitPart === "cm") {
          return num * 96 / 2.54;
        } else if (unitPart === "mm") {
          return num * 96 / 25.4;
        } else if (unitPart === "q") {
          return num * 96.0 / 25.4 / 4.0;
        } else {
          throw new Error(`Invalid unit: ${unitPart} in ${arg}`);
        }
      }

      function parsePercentage() {
        if (!arg.match(/^[0-9\.]+%?$/)) {
          throw new Error(`Invalid percentage: ${arg}`);
        }

        const num = parseFloat(
          arg.endsWith("%") ? arg.slice(0, arg.length - 1) : arg,
        );
        if (num < 0 || isNaN(num)) {
          throw new Error(`Invalid percentage: ${arg}`);
        }

        return num / 100;
      }

      function parseAngle() {
        if (arg.endsWith("deg")) {
          const num = parseFloat(arg.slice(0, arg.length - 3));
          if (isNaN(num)) {
            throw new Error(`Invalid angle: ${arg}`);
          }
          return num;
        } else if (arg.endsWith("grad")) {
          const num = parseFloat(arg.slice(0, arg.length - 4));
          if (isNaN(num)) {
            throw new Error(`Invalid angle: ${arg}`);
          }
          return num * 360 / 400;
        } else if (arg.endsWith("rad")) {
          const num = parseFloat(arg.slice(0, arg.length - 3));
          if (isNaN(num)) {
            throw new Error(`Invalid angle: ${arg}`);
          }
          return num * 180 / Math.PI;
        } else if (arg.endsWith("turn")) {
          const num = parseFloat(arg.slice(0, arg.length - 4));
          if (isNaN(num)) {
            throw new Error(`Invalid angle: ${arg}`);
          }
          return num * 360;
        } else {
          throw new Error(`Invalid angle: ${arg}`);
        }
      }

      let v: any = undefined;

      switch (fn) {
        case "blur":
          v = parsePixel();
          break;

        case "brightness":
        case "contrast":
        case "grayscale":
        case "invert":
        case "opacity":
        case "saturate":
        case "sepia":
          v = parsePercentage();
          break;

        case "drop-shadow":
          if (argc === 0) {
            v = parsePixel();
          } else if (argc === 1) {
            v = parsePixel();
          } else if (argc === 2) {
            v = parseFloat(arg);
            if (isNaN(v)) {
              throw new Error(`Invalid number: ${arg}`);
            }
          } else if (argc === 3) {
            // Pass color string as is, C++ csscolorparser will parse it
            v = arg;
            if (!v) {
              throw new Error(`Invalid color: ${arg}`);
            }
          }
          break;

        case "hue-rotate":
          v = parseAngle();
          break;

        default:
          throw new Error(`Unknown filter function: ${fn}`);
      }

      argc++;
      if (v !== undefined) argv.push(v);
      else throw new Error(`Invalid argument: ${arg}`);

      if (ch === ")") {
        if (argc === 0) {
          throw new Error(`Function ${fn} requires arguments`);
        }

        if (fn === "drop-shadow" && argc !== 4) {
          throw new Error(`Function ${fn} requires four arguments`);
        } else if (fn !== "drop-shadow" && argc !== 1) {
          throw new Error(`Function ${fn} requires one argument`);
        }

        switch (fn) {
          case "blur":
            filters.push({
              type: FilterType.Blur,
              value: argv[0],
            });
            break;

          case "brightness":
            filters.push({
              type: FilterType.Brightness,
              value: argv[0],
            });
            break;

          case "contrast":
            filters.push({
              type: FilterType.Contrast,
              value: argv[0],
            });
            break;

          case "drop-shadow":
            filters.push({
              type: FilterType.DropShadow,
              dx: argv[0],
              dy: argv[1],
              radius: argv[2],
              color: argv[3],
            });
            break;

          case "grayscale":
            filters.push({
              type: FilterType.Grayscale,
              value: argv[0],
            });
            break;

          case "hue-rotate":
            filters.push({
              type: FilterType.HueRotate,
              value: argv[0],
            });
            break;

          case "invert":
            filters.push({
              type: FilterType.Invert,
              value: argv[0],
            });
            break;

          case "opacity":
            filters.push({
              type: FilterType.Opacity,
              value: argv[0],
            });
            break;

          case "saturate":
            filters.push({
              type: FilterType.Saturate,
              value: argv[0],
            });
            break;

          case "sepia":
            filters.push({
              type: FilterType.Sepia,
              value: argv[0],
            });
            break;

          default:
            throw new Error(`Unknown filter function: ${fn}`);
        }

        fn = "";
        argc = 0;
        argv = [];
        state = "fn";
      }
    }

    i++;
  }

  if ((state === "fn" && fn !== "") || state === "args") {
    throw new Error(`Unexpected end of filter string`);
  }

  return filters;
}
