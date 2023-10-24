// PLOT DEFAULTS
const CHART_WIDTH = 500;
const MAP_WIDTH = 350;
const CLIMO_WIDTH = 700;
const CHART_HEIGHT = 500;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DUATION = 300;
const WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right
const HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

// LOAD IN THE DATA //
async function loadData () {
  const metadata = await d3.csv('data/stations.csv');
  const tMonthly = await d3.csv('data/temp_monthly.csv');
  const pMonthly = await d3.csv('data/precip_monthly.csv');
  const tYearly = await d3.csv('data/temp_yearly.csv');
  const pYearly = await d3.csv('data/precip_yearly.csv');
  return { metadata, tMonthly, pMonthly, tYearly, pYearly };
}


// Global datasets
const globalAtmos = {
  metadata: null,
  tMonthly: null,
  pMonthly: null,
  tyearly: null,
  pyeary: null,
};

loadData().then((loadedData) => {

  // load in station, precip, and temperature data
  globalAtmos.metadata = loadedData.metadata;
  globalAtmos.tMonthly = loadedData.tMonthly;
  globalAtmos.pMonthly = loadedData.pMonthly;
  globalAtmos.tyearly = loadedData.tYearly;
  globalAtmos.pyeary = loadedData.pYearly;

  // create svg for map
  d3.select('#utah-map-div')
    .append('svg')
    .attr('width', MAP_WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', CHART_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr('id', 'utah-map-svg');

  // create div for monthly climo
  d3.select('#station-climo-div')
    .append('svg')
    .attr('width', CLIMO_WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', (CHART_HEIGHT + MARGIN.top + MARGIN.bottom)/2)
    .attr('id', 'monthly-climo-svg');

  d3.select('#station-climo-div')
    .append('svg')
    .attr('width', CLIMO_WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', (CHART_HEIGHT + MARGIN.top + MARGIN.bottom)/2)
    .attr('id', 'yearly-climo-svg');


  // call on functions to create default plots when the user enters page
  createMap();
  changeOG();

  // add listeners for any changes in the orographic gradient button
  const datatype = document.getElementById('dtype');
  datatype.addEventListener('change', changeOG);
});

// function to create interactive utah map
function createMap () {

  // select svg
  const mapSVG = d3.select('#utah-map-svg');
  const map = mapSVG.append("g");
  const scatter = mapSVG.append("g").attr("id", "station-scatter");

  let projection = d3.geoConicEqualArea()
    .rotate([110,0])
    .translate([290,830])
    .scale(4750)

  const generator = d3.geoPath().projection(projection);  

  // Loads external data and plot map
  d3.json("data/gz_2010_us_states_20m.json").then( function(data) {

    // this plots the map borders
    map.selectAll("path")
      .data(data.features)
      .join("path")
      .attr("d", generator)
      .attr('stroke', '#9e6015')
      .attr('stroke-width', 2)
      .attr('fill', '#ffe0b4');

  });

  // append the scatter plot dots to the map
  scatter.selectAll("circle")
    .data(globalAtmos.metadata)
    .join('circle')
    .attr("cx", d => {return projection([+d.LONGITUDE, +d.LATITUDE])[0]; }) 
    .attr("cy", d => {return projection([+d.LONGITUDE, +d.LATITUDE])[1]; })
    .attr("r", 5)
    .style("fill", "black")
    .attr('id', d => {return d.NAME; })
    .on('click', d => {updateStationClimo(d.target.id); })
    .on('mouseover', d => {d3.select(d.target).attr("r", 10)}) // increases size during hover
    .on('mouseout', d => {d3.select(d.target).attr("r", 5)}); // decreases size after hover

}



// function for updating the station climatology next to the map based on named passed
function updateStationClimo (name) {
  // months and years to be plotted
  const months = [1,2,3,4,5,6,7,8,9,10,11,12];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // pull desired data
  const pMonthly = globalAtmos.pMonthly.filter((d) => {return d.NAME === name})
  //const tMonthly = globalAtmos.tMonthly.filter((d) => {return d.NAME === name})
  //const pYearly = globalAtmos.pYearly.filter((d) => {return d.NAME === name})
  //const tYearly = globalAtmos.tYearly.filter((d) => {return d.NAME === name})

  // MONTHLY CLIMO
  let svg = d3.select("#monthly-climo-svg");
  svg.selectAll('*').remove();

  // x-axis
  const xScale = d3.scaleBand()
    .range([0, CLIMO_WIDTH])
    .domain(monthNames.map((d) => d))
    .padding(0.2);
  //const xScaleFmt = d3.timeFormat("%b");

  svg.append('g')
    .attr('transform', `translate(${MARGIN.left}, ${(CHART_HEIGHT - MARGIN.bottom - MARGIN.top)/2})`)
    .call(d3.axisBottom(xScale));

  // y-axis
  const yScale = d3.scaleLinear()
    .range([(CHART_HEIGHT-MARGIN.top-MARGIN.bottom)/2, MARGIN.top])
    .domain([0, d3.max(months.map((idx) => pMonthly[0][idx]))])
    .nice();

  svg.append('g')
    .attr('transform', `translate(${MARGIN.left}, 0)`)
    .call(d3.axisLeft(yScale));

  svg.append('rect')
    .data(pMonthly)
    .attr("x", xScale(monthNames))
    .attr("y", yScale(months.map((idx) => pMonthly[0][idx])))
    .attr('height', CHART_HEIGHT - yScale(months.map((idx) => pMonthly[0][idx])) - MARGIN.bottom - MARGIN.top)
    .attr('width', xScale.bandwidth())





  // YEARLY CLIMO
  //let svg = d3.select("#yearly-climo-svg");

  console.log('running update station climo')


}


function changeOG () {
  // pull value of orographic gradient dataset
  const dataFile = d3.select('#dtype').property('value');

  // plot orographic gradients


}




  