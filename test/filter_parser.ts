import { Filter, FilterType, parseFilterString } from "../src/filter.ts";
import { assertEquals } from "./deps.ts";

function parserTest(input: string, output: Filter[]) {
  assertEquals(parseFilterString(input), output);
}

function parserExpectError(input: string) {
  try {
    parseFilterString(input);
    throw new Error("Expected error");
  } catch (e) {
    if (e.message === "Expected error") {
      throw e;
    }
  }
}

Deno.test("parseFilterString", async (t) => {
  await t.step("blur", () => {
    parserTest("blur(10px)", [
      {
        type: FilterType.Blur,
        value: 10,
      },
    ]);

    parserTest("blur(10in)", [
      {
        type: FilterType.Blur,
        value: 10 * 96,
      },
    ]);

    parserTest("blur(10px) blur(20px)", [
      {
        type: FilterType.Blur,
        value: 10,
      },
      {
        type: FilterType.Blur,
        value: 20,
      },
    ]);

    parserExpectError("blur()");
    parserExpectError("blur(10px 20px)");
    parserExpectError("blur(10px, 20px)");
  });

  await t.step("brightness", () => {
    parserTest("brightness(10)", [
      {
        type: FilterType.Brightness,
        value: 0.1,
      },
    ]);

    parserTest("brightness(10) brightness(20)", [
      {
        type: FilterType.Brightness,
        value: 0.1,
      },
      {
        type: FilterType.Brightness,
        value: 0.2,
      },
    ]);

    parserExpectError("brightness()");
    parserExpectError("brightness(10px)");
    parserExpectError("brightness(10px 20px)");
    parserExpectError("brightness(10px, 20px)");
  });

  await t.step("contrast", () => {
    parserTest("contrast(10)", [
      {
        type: FilterType.Contrast,
        value: 0.1,
      },
    ]);
  });

  await t.step("drop-shadow", () => {
    parserTest("drop-shadow(10px 20px 30px #000)", [
      {
        type: FilterType.DropShadow,
        dx: 10,
        dy: 20,
        radius: 30,
        color: "#000",
      },
    ]);

    parserTest("drop-shadow(10px, 20px, 30px, #000)", [
      {
        type: FilterType.DropShadow,
        dx: 10,
        dy: 20,
        radius: 30,
        color: "#000",
      },
    ]);

    parserTest(
      "drop-shadow(10px 20px 30px #000) drop-shadow(40px 50px 60px #fff)",
      [
        {
          type: FilterType.DropShadow,
          dx: 10,
          dy: 20,
          radius: 30,
          color: "#000",
        },
        {
          type: FilterType.DropShadow,
          dx: 40,
          dy: 50,
          radius: 60,
          color: "#fff",
        },
      ],
    );

    parserExpectError("drop-shadow()");
    parserExpectError("drop-shadow(10px 20px 30px)");
    parserExpectError("drop-shadow(10px 20px 30px #000 #fff)");
  });
});
