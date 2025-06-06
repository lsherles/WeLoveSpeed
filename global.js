import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Global constants for dimensions
const width = 800;
const height = 500;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };
let bpmText;
let heart;
let dataset = [];
document.addEventListener("DOMContentLoaded", async () => {
  if (
    !document.body.classList.contains("light-mode") &&
    !document.body.classList.contains("dark-mode")
  ) {
    document.body.classList.add("light-mode");
  }

  const input = await d3.csv("input.csv");
  const output = await d3.csv("output.csv");

  dataset = input.map((row, i) => {
    const features = Object.values(row).map(Number);
    const targets = Object.values(output[i]).map(Number);
    return { features, targets };
  });
});

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function knnRegress(trainData, testPoint, k = 5) {
  const distances = trainData.map((data) => ({
    distance: euclideanDistance(data.features, testPoint),
    targets: data.targets,
  }));

  distances.sort((a, b) => a.distance - b.distance);

  const neighbors = distances.slice(0, k);

  const avgSpeed = d3.mean(neighbors, (d) => d.targets[0]);
  const avgHr = d3.mean(neighbors, (d) => d.targets[1]);

  return { speed: avgSpeed, hr: avgHr };
}

// Function for initializing the track animation
export function initTrackAnimation(speed, hr) {
  clearTrack();
  const svg = d3.select("#track-svg");
  const trackColor = "darkred";
  const dotColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--dot-light")
    .trim();
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--text-light")
    .trim();

  const trackWidth = width * 0.6;
  const trackHeight = height * 0.75;
  const centerX = width / 2;
  const centerY = height / 2;

  const trackPath = svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", trackColor)
    .attr("stroke-width", 20)
    .attr("stroke-linejoin", "round") // Ensure smooth joins between curves
    .attr("stroke-linecap", "round") // Ensure smooth ends of path
    .attr(
      "d",
      `
      M ${centerX - trackWidth / 2},${centerY - trackHeight / 2}
      A ${trackWidth / 2},${trackHeight / 2} 0 0 1 ${
        centerX + trackWidth / 2
      },${centerY - trackHeight / 2}
      L ${centerX + trackWidth / 2},${centerY + trackHeight / 2}
      A ${trackWidth / 2},${trackHeight / 2} 0 0 1 ${
        centerX - trackWidth / 2
      },${centerY + trackHeight / 2}
      Z
    `
    );
  updateHeartRate(hr); // start the heart pulsing animation

  const dot = svg.append("circle").attr("r", 10).attr("fill", dotColor);

  const pathNode = trackPath.node();
  const pathLength = pathNode.getTotalLength();

  function animateDot() {
    dot
      .transition()
      .duration((400 / 1609 / speed) * 360000)
      .ease(d3.easeLinear)
      .attrTween("transform", () => (t) => {
        const point = pathNode.getPointAtLength(t * pathLength);
        return `translate(${point.x},${point.y})`;
      })
      .on("end", animateDot);
  }

  // Add heart at center
  const heartG = svg
    .append("g")
    .attr("transform", `translate(${centerX}, ${centerY - 100})`);

  const heartPathData =
    "M0,-30 C-25,-50 -55,-15 -35,10 C-20,25 0,40 0,55 C0,40 20,25 35,10 C55,-15 25,-50 0,-30 Z";

  heart = heartG
    .append("path")
    .attr("d", heartPathData)
    .attr("fill", d3.interpolateReds(0.8))
    .attr("stroke", "darkred")
    .attr("stroke-width", 2);

  bpmText = heartG
    .append("text")
    .attr("class", "bpm-text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("fill", "white")
    .attr("font-size", "18px")
    .text(`${Math.round(hr)}bpm`);

  animateDot();
  showPredictionText(svg, centerX, centerY, speed, hr, textColor);
}
// Function to clear the track animation
function clearTrack() {
  d3.select("#track-svg").selectAll("*").remove();
}

// Function to display the prediction text
function showPredictionText(svg, centerX, centerY, speed, hr, textColor) {
  const centerText = svg
    .append("text")
    .attr("x", centerX)
    .attr("y", centerY - 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "32px")
    .attr("fill", textColor);
  centerText
    .append("tspan")
    .attr("x", centerX)
    .attr("dy", "1.4em")
    .text(`Heart Rate: ${Math.round(hr)} bpm`)
    .attr("font-size", "28px");

  centerText
    .append("tspan")
    .attr("x", centerX)
    .attr("dy", "1em")
    .text(`Speed: ${speed.toFixed(2)} mph`)
    .attr("font-size", "28px");

  centerText
    .append("tspan")
    .attr("x", centerX)
    .attr("dy", "1.4em")
    .text("400m Olympic Track")
    .attr("font-size", "24px");

  centerText
    .append("tspan")
    .attr("x", centerX)
    .attr("dy", "1em")
    .text(
      `${Math.floor(((400 / 1609 / speed) * 3600) / 60)} min ${
        parseInt((400 / 1609 / speed) * 3600) % 60
      } sec`
    )
    .attr("font-size", "50px");
}

// Setup theme toggle logic
export function setupThemeToggle() {
  const themeButton = document.getElementById("themeButton");
  themeButton.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      updateTrackColors("light");
    } else {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      updateTrackColors("dark");
    }
  });
}

// Update track colors based on theme
function updateTrackColors(theme) {
  const trackColor = getComputedStyle(document.documentElement)
    .getPropertyValue(theme === "dark" ? "--track-red-dark" : "--track-red")
    .trim();
  const dotColor = getComputedStyle(document.documentElement)
    .getPropertyValue(theme === "dark" ? "--dot-dark" : "--dot-light")
    .trim();
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue(theme === "dark" ? "--text-dark" : "--text-light")
    .trim();

  d3.select("path").attr("stroke", trackColor);
  d3.select("circle").attr("fill", dotColor);
  d3.selectAll("text:not(.bpm-text)").attr("fill", textColor);
}

// // Heart SVG setup
// const heartSvg = d3.select("#heart-svg");
// const heartG = heartSvg.append("g")
//   .attr("transform", `translate(${heartSvg.attr("width") / 2}, ${heartSvg.attr("height") / 2}) scale(1)`);

// const heartPath = "M0,-30 C-25,-50 -55,-15 -35,10 C-20,25 0,40 0,55 C0,40 20,25 35,10 C55,-15 25,-50 0,-30 Z";

// const heart = heartG.append("path")
//   .attr("d", heartPath)
//   .attr("fill", d3.interpolateReds(0.8))
//   .attr("stroke", "darkred")
//   .attr("stroke-width", 2);

// const bpmText = heartG.append("text")
//   .attr("text-anchor", "middle")
//   .attr("dy", "0.35em")
//   .attr("fill", "white")
//   .attr("font-size", "18px")
//   .text("60");

let bpm = 60;
let beatSpeed = 60000 / bpm;

function updateHeart() {
  beatSpeed = 60000 / bpm;
  if (bpmText) {
    bpmText.text(`${parseInt(bpm)} bpm`);
  }
  heart
    .transition()
    .duration(beatSpeed / 2)
    .attr("transform", "scale(1.3)")
    .transition()
    .duration(beatSpeed / 2)
    .attr("transform", "scale(1)");
}
let beatInterval = null;

// Function to update the heart rate on the heart
export function updateHeartRate(predictedBpm) {
  bpm = predictedBpm;
  if (!heart) return; // guard: skip if heart is not yet created
  if (bpmText) {
    bpmText.text(`${parseInt(bpm)} bpm`);
  }

  if (beatInterval) {
    beatInterval.stop();
  }

  beatSpeed = 60000 / bpm;
  beatInterval = d3.interval(updateHeart, beatSpeed);
}

// Setup prediction logic (form validation and KNN regression)
export function setupPrediction() {
  document.getElementById("filter").addEventListener("click", () => {
    const heightInput = parseFloat(
      document.getElementById("heightInput").value
    );
    const weightInput = parseFloat(
      document.getElementById("weightInput").value
    );
    const ageInput = parseFloat(document.getElementById("ageInput").value);
    const sexInput = document
      .querySelector('input[name="sex"]:checked')
      .value.trim()
      .toLowerCase();
    const zoneInput = Number(
      document.querySelector('input[name="goal"]:checked').value
    );

    // Clear previous errors
    document
      .querySelectorAll(".error-message")
      .forEach((div) => (div.textContent = ""));
    let hasError = false;

    // Input validation
    if (isNaN(heightInput) || heightInput <= 0) {
      document.getElementById("heightError").textContent =
        "Please enter a valid height.";
      hasError = true;
    }
    if (isNaN(weightInput) || weightInput <= 0) {
      document.getElementById("weightError").textContent =
        "Please enter a valid weight.";
      hasError = true;
    }
    if (isNaN(ageInput) || ageInput < 13) {
      document.getElementById("ageError").textContent =
        "Please enter a valid age (minimum 13).";
      hasError = true;
    }
    if (sexInput !== "male" && sexInput !== "female") {
      document.getElementById("sexError").textContent =
        "Please select 'male' or 'female'.";
      hasError = true;
    }
    const zoneNumeric = parseInt(zoneInput);
    if (isNaN(zoneNumeric) || zoneNumeric < 1 || zoneNumeric > 5) {
      document.getElementById("zoneError").textContent =
        "Please select a zone between 1 and 5.";
      hasError = true;
    }

    if (hasError) return;

    // Run prediction
    const sexNumeric = sexInput === "male" ? 1 : 0;
    const filterPoint = [
      weightInput,
      heightInput,
      ageInput,
      sexNumeric,
      zoneNumeric,
    ];
    const prediction = knnRegress(dataset, filterPoint);

    console.log("Predicted Speed:", prediction.speed.toFixed(2));
    console.log("Predicted HR:", prediction.hr.toFixed(2));
    initTrackAnimation(prediction.speed, prediction.hr);
    updateHeartRate(prediction.hr);
  });
}
