const width = 800;
const height = 500;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };

const svg = d3.select("#scatterplot")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.csv("data.csv").then(data => {
  data.forEach(d => {
    d.x = +d.x;
    d.y = +d.y;
  });

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y))
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
             .html(`x: ${d.x}<br>y: ${d.y}`)
             .style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 20) + "px");
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
});
