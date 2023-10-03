// area to place constants
const CHART_WIDTH = 500;
const MAP_WIDTH = 350;
const CLIMO_WIDTH = 700;
const CHART_HEIGHT = 500;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DUATION = 300;
const WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right
const HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

// add the main function
main();

function main () {

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
}

// function to create interactive utah map
function createMap () {

  // select svg
  const svg = d3.select('#utah-map-svg');

  const projection = d3.geoConicEqualArea()
    .rotate([110,0])
    .translate([290,830])
    .scale(4750)

  const generator = d3.geoPath().projection(projection);  

  // Loads external data and plot map
  d3.json("data/gz_2010_us_states_20m.json").then( function(data) {

    // this plots the map borders
    svg.selectAll("path")
      .data(data.features)
      .join("path")
      .attr("d", generator)
      .attr('stroke', '#9e6015')
      .attr('stroke-width', 2)
      .attr('fill', '#ffe0b4');

  });
}



// function for updating the station climatology next to the map
function updateStationClimo () {


}


function changeOG () {
  // pull value of orographic gradient dataset
  const dataFile = d3.select('#dtype').property('value');

  // plot orographic gradients


}




  