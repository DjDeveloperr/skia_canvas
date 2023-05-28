import { SvgCanvas } from "../mod.ts";

const canvas = new SvgCanvas(120, 120, {
  noPrettyXml: true,
});
const ctx = canvas.getContext();

ctx.fillStyle = "white";
ctx.fillRect(0, 0, 120, 120);

ctx.lineWidth = 10;

// Wall
ctx.strokeRect(75, 140, 150, 110);

// Door
ctx.fillRect(130, 190, 40, 60);

// Roof
ctx.beginPath();
ctx.moveTo(50, 140);
ctx.lineTo(150, 60);
ctx.lineTo(250, 140);
ctx.closePath();
ctx.stroke();

canvas.complete();

canvas.save("./testdata/test.svg");
canvas.save("./testdata/test2.svg");

console.log("done");
