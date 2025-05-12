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

function knnRegress(trainData, testPoint, k = 10) {
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