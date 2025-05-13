const width = 800;
const height = 500;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };


import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const input = await d3.csv("input.csv")
const output = await d3.csv("output.csv")

const dataset = input.map((row, i) => {
  const features = Object.values(row).map(Number);
  const targets = Object.values(output[i]).map(Number);
  return { features, targets };
});

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function knnRegress(trainData, testPoint, k = 5) {
  const distances = trainData.map(data => ({
    distance: euclideanDistance(data.features, testPoint),
    targets: data.targets
  }));

  distances.sort((a, b) => a.distance - b.distance);

  const neighbors = distances.slice(0, k);

  const avgSpeed = d3.mean(neighbors, d => d.targets[0]);
  const avgHr = d3.mean(neighbors, d => d.targets[1]);

  return { speed: avgSpeed, hr: avgHr };
}
//How to use the model
console.log(dataset[0]);
const testPoint = [10.8,48.8,163,1,3];
console.log(knnRegress(dataset,testPoint)); //outputs dict type with speed and hr components


// Load data
d3.csv("averages.csv").then(raw => {
  raw.forEach(d => {
    d.ID = d.ID;
    d.Age = +d.Age;
    d.Weight = +d.Weight;
    d.Height = +d.Height;
    d.Humidity = +d.Humidity;
    d.Sex = d.Sex.trim().toLowerCase();
    d.Speed = +d.Speed;
    d.HR = +d.HR;
    d.VO2 = +d.VO2;
    d.VCO2 = +d.VCO2;
    d.RR = +d.RR;
    d.VE = +d.VE;
  });

})
document.getElementById("filter").addEventListener("click", () => {
  // Get input values
  const heightInput = parseFloat(document.getElementById("heightInput").value);
  const weightInput = parseFloat(document.getElementById("weightInput").value);
  const ageInput = parseFloat(document.getElementById("ageInput").value);
  const sexInput = document.getElementById("sexInput").value.trim().toLowerCase();
  const zoneInput = document.getElementById("zoneInput").value;
  document.querySelectorAll(".error-message").forEach(div => div.textContent = "");
  let hasError = false;
  if (isNaN(heightInput) || heightInput <= 0) {
    document.getElementById("heightError").textContent = "Please enter a valid height.";
    hasError = true;
  }
  if (isNaN(weightInput) || weightInput <= 0) {
    document.getElementById("weightError").textContent = "Please enter a valid weight.";
    hasError = true;
  }
  if (isNaN(ageInput) || ageInput < 13) {
    document.getElementById("ageError").textContent = "Please enter a valid age (minimum 13).";
    hasError = true;
  }
  if (sexInput !== "male" && sexInput !== "female") {
    document.getElementById("sexError").textContent = "Please select 'male' or 'female'.";
    hasError = true;
  }
  const zoneNumeric = parseInt(zoneInput);
  if (isNaN(zoneNumeric) || zoneNumeric < 1 || zoneNumeric > 5) {
    document.getElementById("zoneError").textContent = "Please select a zone between 1 and 5.";
    hasError = true;
  }
  if (hasError) return;

  // Run prediction
  const sexNumeric = sexInput === "male" ? 1 : 0;
  const filterPoint = [weightInput, heightInput, ageInput, sexNumeric, zoneNumeric];

  const prediction = knnRegress(dataset, filterPoint);
  console.log("Predicted Speed:", prediction.speed.toFixed(2));
  console.log("Predicted HR:", prediction.hr.toFixed(2));
});






// Previous code for scatter plot 
// const svg = d3.select("#scatterplot")
//   .append("svg")
//   .attr("width", width)
//   .attr("height", height);

// const tooltip = d3.select("body")
//   .append("div")
//   .attr("class", "tooltip");

// let data, xScale, yScale;

  // xScale = d3.scaleLinear()
  //   .domain(d3.extent(data, d => d.Speed))
  //   .range([margin.left, width - margin.right]);

  // yScale = d3.scaleLinear()
  //   .domain(d3.extent(data, d => d.HR))
  //   .range([height - margin.bottom, margin.top]);

  // // Axes
  // svg.append("g")
  //   .attr("transform", `translate(0, ${height - margin.bottom})`)
  //   .call(d3.axisBottom(xScale))
  //   .append("text")
  //   .attr("x", width / 2)
  //   .attr("y", 40)
  //   .attr("fill", "black")
  //   .attr("text-anchor", "middle")
  //   .text("Average Speed (km/h)");

  // svg.append("g")
  //   .attr("transform", `translate(${margin.left}, 0)`)
  //   .call(d3.axisLeft(yScale))
  //   .append("text")
  //   .attr("transform", "rotate(-90)")
  //   .attr("x", -height / 2)
  //   .attr("y", -40)
  //   .attr("fill", "black")
  //   .attr("text-anchor", "middle")
  //   .text("Average HR (beats/min)");

//   updatePlot(data);
// });

// function updatePlot(filtered) {
//   svg.selectAll("circle").remove();

//   svg.selectAll("circle")
//     .data(filtered)
//     .join("circle")
//     .attr("cx", d => xScale(d.Speed))
//     .attr("cy", d => yScale(d.HR))
//     .attr("r", 5)
//     .attr("fill", "tomato")
    // .on("mouseover", function(event, d) {
    //   d3.select(this).attr('r', 7).attr('fill', 'blue');
    //   tooltip.style("opacity", 1)
    //     .html(`
    //       <strong>ID:</strong> ${d.ID}<br>
    //       <strong>Age:</strong> ${d.Age.toFixed(2)}<br>
    //       <strong>Sex:</strong> ${d.Sex}<br>
    //       <strong>Height (cm):</strong> ${d.Height.toFixed(2)}<br>
    //       <strong>Weight (kg):</strong> ${d.Weight.toFixed(2)}<br>
    //       <strong>Humidity:</strong> ${d.Humidity.toFixed(2)}<br>
    //       <strong>HR:</strong> ${d.HR.toFixed(2)}<br>
    //       <strong>VO2:</strong> ${d.VO2.toFixed(2)}<br>
    //       <strong>VCO2:</strong> ${d.VCO2.toFixed(2)}<br>
    //       <strong>RR:</strong> ${d.RR.toFixed(2)}<br>
    //       <strong>VE:</strong> ${d.VE.toFixed(2)}
    //     `)
    //     .style("left", (event.pageX + 10) + "px")
    //     .style("top", (event.pageY - 20) + "px");
    // })
    
    // .on("mousemove", function(event) {
    //   tooltip.style("left", (event.pageX + 10) + "px")
    //     .style("top", (event.pageY - 20) + "px");
    // })
    // .on("mouseout", function() {
    //   d3.select(this)
    //   .attr("r", 5)
    //   .attr("fill", "tomato");
    //   tooltip.style("opacity", 0);
    // });
