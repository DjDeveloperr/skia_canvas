import { createCanvas } from "../mod.ts";
// @deno-types="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/types/index.esm.d.ts"
import {
  Chart,
  registerables,
} from "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js";

Chart.register(...registerables);

console.log("Running Deno benchmark...");
const denoOut = new TextDecoder().decode(
  Deno.spawnSync(Deno.execPath(), {
    args: ["task", "bench"],
    env: {
      NO_COLOR: "1",
    },
    stdout: "piped",
  }).stdout,
).split("\n").map((line) => line.trim()).filter((line) => line);

console.log("Running Node benchmark...");
const nodeOut = new TextDecoder().decode(
  Deno.spawnSync(Deno.execPath(), {
    args: ["task", "bench-node"],
    env: {
      NO_COLOR: "1",
    },
    stdout: "piped",
  }).stdout,
).split("\n").map((line) => line.trim()).filter((line) => line);

const cpu = denoOut[0].split(":")[1].trim();
const deno = denoOut[1].split(":")[1].trim();
const node = nodeOut[1].split(":")[1].trim();

const raw = [];

const combined = denoOut.concat(nodeOut);

for (let i = 2; i < combined.length; i++) {
  const line = combined[i];
  if (
    line.startsWith("encoding:") || line.startsWith("gradient:") ||
    line.startsWith("images:")
  ) {
    const [name, out] = line.split(":").map((s) => s.trim());
    const [runtime, lib, time] = out.split(/ +/).map((s) => s.trim()).filter((
      s,
    ) => s);
    raw.push({
      name,
      runtime,
      lib,
      time: parseFloat(time),
    });
  }
}

console.log(`CPU: ${cpu}`);
console.log(`Deno: ${deno}`);
console.log(`Node: ${node}`);

const data = {
  labels: [],
  datasets: [],
};

const benches = {};
raw.forEach((bench) => {
  const id = `${bench.runtime} ${bench.lib}`;
  if (!benches[id]) {
    benches[id] = {};
  }
  if (!data.labels.includes(bench.name)) {
    data.labels.push(bench.name);
  }
  benches[id][bench.name] = bench.time;
});

data.labels.push("average");

for (const bench of Object.values(benches)) {
  bench["average"] = Object.values(bench).reduce((a, b) => a + b, 0) /
    Object.values(bench).length;
}

const backgroundColor = [
  "#4285f4",
  "#ea4336",
  "#fbbb07",
  "#34a753",
  "#ff6d01",
];

let i = 0;
for (const [name, bench] of Object.entries(benches)) {
  data.datasets.push({
    label: name,
    data: data.labels.map((label) => bench[label]),
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: backgroundColor[i++],
  });
}

const canvas = createCanvas(800, 600);
const ctx = canvas.getContext("2d");

console.log("Rendering chart...");

const _chart = new Chart(ctx, {
  type: "bar",
  data,
  options: {
    plugins: {
      title: {
        display: true,
        text: `Canvas Benchmark (${cpu})`,
      },
      subtitle: {
        display: true,
        text: `(Lower is better)`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "time/iter (ms)",
        },
      },
      x: {
        title: {
          display: true,
          text: "benchmark",
        },
      },
    },
    responsive: false,
    animation: false,
  },
  plugins: [
    {
      id: "custom_canvas_background_color",
      beforeDraw: (chart) => {
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    },
  ],
});

canvas.save("bench/results.png");
console.log("Done!");
