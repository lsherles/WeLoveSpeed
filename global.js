const width = 800;
const height = 500;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };

const svg = d3.select("#scatterplot")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

let data, xScale, yScale;

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

  data = raw;

  xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Speed))
    .nice()
    .range([margin.left, width - margin.right]);

  yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.HR))
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Average Speed (km/h)");

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Average HR (beats/min)");

  updatePlot(data);
});

function updatePlot(filtered) {
  svg.selectAll("circle").remove();

  svg.selectAll("circle")
    .data(filtered)
    .join("circle")
    .attr("cx", d => xScale(d.Speed))
    .attr("cy", d => yScale(d.HR))
    .attr("r", 5)
    .attr("fill", "tomato")
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`
          <strong>ID:</strong> ${d.ID}<br>
          <strong>Age:</strong> ${d.Age.toFixed(2)}<br>
          <strong>Sex:</strong> ${d.Sex}<br>
          <strong>Height (cm):</strong> ${d.Height.toFixed(2)}<br>
          <strong>Weight (kg):</strong> ${d.Weight.toFixed(2)}<br>
          <strong>Humidity:</strong> ${d.Humidity.toFixed(2)}<br>
          <strong>HR:</strong> ${d.HR.toFixed(2)}<br>
          <strong>VO2:</strong> ${d.VO2.toFixed(2)}<br>
          <strong>VCO2:</strong> ${d.VCO2.toFixed(2)}<br>
          <strong>RR:</strong> ${d.RR.toFixed(2)}<br>
          <strong>VE:</strong> ${d.VE.toFixed(2)}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mousemove", event => {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
}

document.getElementById("filter").addEventListener("click", () => {
  const heightInput = document.getElementById("heightInput").value.trim();
  const weightInput = document.getElementById("weightInput").value.trim();
  const ageInput = document.getElementById("ageInput").value.trim();
  const humidityInput = document.getElementById("humidityInput").value.trim();
  const sexInput = document.getElementById("sexInput").value.trim().toLowerCase();

  const filtered = data.filter(d => {
    const matchesHeight = heightInput === "" || Math.abs(d.Height - parseFloat(heightInput)) < 5.08/2;
    const matchesWeight = weightInput === "" || Math.abs(d.Weight - parseFloat(weightInput)) < 4.53592/2;
    const matchesAge = ageInput === "" || Math.abs(d.Age - parseFloat(ageInput)) < 1/2;
    const matchesHumidity = humidityInput === "" || Math.abs(d.Humidity - parseFloat(humidityInput)) < 1/2;
    const matchesSex = sexInput === "" || d.Sex === sexInput;

    return matchesHeight && matchesWeight && matchesAge && matchesHumidity && matchesSex;
  });

  updatePlot(filtered);
});
