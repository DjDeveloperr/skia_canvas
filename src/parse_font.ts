// https://github.com/Automattic/node-canvas/blob/b3e7df319c045c1dc74e390f4b3af161304c9c55/lib/parse-font.js

"use strict";

/**
 * Font RegExp helpers.
 */

const weights = "bold|bolder|lighter|[1-9]00";
const styles = "italic|oblique";
const variants = "small-caps";
const stretches =
  "ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded";
const units = "px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q";
const string = "'([^']+)'|\"([^\"]+)\"|[\\w\\s-]+";

// [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]?
//    <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ]
// https://drafts.csswg.org/css-fonts-3/#font-prop
const weightRe = new RegExp(`(${weights}) +`, "i");
const styleRe = new RegExp(`(${styles}) +`, "i");
const variantRe = new RegExp(`(${variants}) +`, "i");
const stretchRe = new RegExp(`(${stretches}) +`, "i");
const sizeFamilyRe = new RegExp(
  `([\\d\\.]+)(${units}) *((?:${string})( *, *(?:${string}))*)`,
);

/**
 * Cache font parsing.
 */

// deno-lint-ignore no-explicit-any
const cache: Record<string, any> = {};

const defaultHeight = 16; // pt, common browser default

/**
 * Parse font `str`.
 */
// deno-lint-ignore no-explicit-any
export function parseFont(str: string): any {
  // Cached
  if (cache[str]) return cache[str];

  // Try for required properties first.
  const sizeFamily = sizeFamilyRe.exec(str);
  if (!sizeFamily) return; // invalid

  // Default values and required properties
  // deno-lint-ignore no-explicit-any
  const font: any = {
    weight: "normal",
    style: "normal",
    stretch: "normal",
    variant: "normal",
    size: parseFloat(sizeFamily[1]),
    unit: sizeFamily[2],
    family: sizeFamily[3].replace(/["']/g, "").replace(/ *, */g, ","),
  };

  // Optional, unordered properties.
  let weight, style, variant, stretch;
  // Stop search at `sizeFamily.index`
  const substr = str.substring(0, sizeFamily.index);
  if ((weight = weightRe.exec(substr))) font.weight = weight[1];
  if ((style = styleRe.exec(substr))) font.style = style[1];
  if ((variant = variantRe.exec(substr))) font.variant = variant[1];
  if ((stretch = stretchRe.exec(substr))) font.stretch = stretch[1];

  // Convert to device units. (`font.unit` is the original unit)
  // TODO: ch, ex
  switch (font.unit) {
    case "pt":
      font.size /= 0.75;
      break;
    case "pc":
      font.size *= 16;
      break;
    case "in":
      font.size *= 96;
      break;
    case "cm":
      font.size *= 96.0 / 2.54;
      break;
    case "mm":
      font.size *= 96.0 / 25.4;
      break;
    case "%":
      // TODO disabled because existing unit tests assume 100
      // font.size *= defaultHeight / 100 / 0.75
      break;
    case "em":
    case "rem":
      font.size *= defaultHeight / 0.75;
      break;
    case "q":
      font.size *= 96 / 25.4 / 4;
      break;
  }

  switch (font.weight) {
    case "lighter":
    case "100":
      font.weight = 100;
      break;
    case "200":
      font.weight = 200;
      break;
    case "300":
      font.weight = 300;
      break;
    case "normal":
    case "400":
      font.weight = 400;
      break;
    case "500":
      font.weight = 500;
      break;
    case "600":
      font.weight = 600;
      break;
    case "bold":
    case "bolder":
    case "700":
      font.weight = 700;
      break;
    case "800":
      font.weight = 800;
      break;
    case "900":
      font.weight = 900;
      break;
    default:
      font.weight = 400;
      break;
  }

  switch (font.style) {
    case "normal":
      font.style = 0;
      break;
    case "italic":
      font.style = 1;
      break;
    case "oblique":
      font.style = 2;
      break;
  }

  switch (font.stretch) {
    case "ultra-condensed":
    case "50%":
      font.stretch = 1;
      break;
    case "extra-condensed":
    case "62.5%":
      font.stretch = 2;
      break;
    case "condensed":
    case "75%":
      font.stretch = 3;
      break;
    case "semi-condensed":
    case "87.5%":
      font.stretch = 4;
      break;
    case "normal":
    case "100%":
      font.stretch = 5;
      break;
    case "semi-expanded":
    case "112.5%":
      font.stretch = 6;
      break;
    case "expanded":
    case "125%":
      font.stretch = 7;
      break;
    case "extra-expanded":
    case "150%":
      font.stretch = 8;
      break;
    case "ultra-expanded":
    case "200%":
      font.stretch = 9;
  }

  switch (font.variant) {
    case "normal":
      font.variant = 0;
      break;
    case "small-caps":
      font.variant = 1;
      break;
  }

  return (cache[str] = font);
}
