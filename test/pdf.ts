import { PdfDocument } from "../mod.ts";

const pdf = new PdfDocument({
  title: "Deno Skia Canvas",
  author: "Dj",
  creation: new Date(),
  modified: new Date(),
});

const ctx = pdf.newPage(120, 120, { x: 10, y: 10, w: 100, h: 100 });

ctx.fillStyle = "red";
ctx.fillRect(0, 0, 100, 100);

ctx.fillStyle = "blue";
ctx.fillRect(10, 10, 80, 80);

pdf.endPage();

pdf.save("./testdata/test.pdf");
console.log("done");
