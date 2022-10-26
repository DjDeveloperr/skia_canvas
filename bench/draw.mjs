export function draw(ctx) {
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#03a9f4";
  ctx.fillStyle = "#03a9f4";

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
}

export function drawGradient(ctx) {
  // Linear gradient (left)
  const linearGradient = ctx.createLinearGradient(20, 0, 220, 0);
  linearGradient.addColorStop(0, "green");
  linearGradient.addColorStop(0.5, "cyan");
  linearGradient.addColorStop(1, "green");

  ctx.fillStyle = linearGradient;
  ctx.fillRect(0, 0, 512, 512);

  // Radial gradient (right)
  const radialGradient = ctx.createRadialGradient(110, 90, 30, 100, 100, 70);
  radialGradient.addColorStop(0, "pink");
  radialGradient.addColorStop(0.9, "white");
  radialGradient.addColorStop(1, "green");

  ctx.fillStyle = radialGradient;
  ctx.fillRect(512, 0, 512, 512);
}

export function drawImage(ctx, skiaImage, testImage) {
  ctx.drawImage(skiaImage, 0, 0);
  ctx.drawImage(testImage, 0, 100);
  ctx.drawImage(testImage, 0, 400, 1000, 1000);
}
