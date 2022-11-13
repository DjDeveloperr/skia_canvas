import { createCanvas } from "../mod.ts";
// @deno-types="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/types/index.esm.d.ts"
import {
  Chart,
  registerables,
} from "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js";

Chart.register(...registerables);

const canvas = createCanvas(800, 600);
const ctx = canvas.getContext("2d");

const myChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [{
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    }],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    animation: false,
  },
});

canvas.save("testdata/chart.png");
console.log("Rendered chart to testdata/chart.png");
