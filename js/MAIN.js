// PLOT DEFAULTS
const CHART_WIDTH = 500;
const CHART_HEIGHT = 500;

const MAP_WIDTH = 450;
const MAP_HEIGHT = 600;
const CLIMO_WIDTH = MAP_WIDTH*2;
const CLIMO_HEIGHT = MAP_HEIGHT/2;

const NHWR_WIDTH = 1100;
const NHWR_HEIGHT = 500;

const MARGIN = { left: 65, bottom: 20, top: 20, right: 30 };
const ANIMATION_DUATION = 300;
const WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right
const HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

// LOAD IN THE DATA //
async function loadData () {
  const metadata = await d3.csv('data/stations.csv');
  const tMonthly = await d3.csv('data/temp_monthly.csv');
  const pMonthly = await d3.csv('data/precip_monthly.csv');
  const tYearly = await d3.csv('data/temp_yearly.csv');
  const pYearly = await d3.csv('data/precip_yearly_sum.csv');
  const pCoolSsn = await d3.csv('data/station_cool_season_PRCP.csv');
  const tWarmSsn = await d3.csv('data/station_warm_season_TAVG.csv');

  const gsl_water_level = await d3.csv('data/GSL_monthly_water_elev');
  const wildfire_acres = await d3.csv('data/utah_wildfire_yearly_acres')
  return { metadata, tMonthly, pMonthly, tYearly, pYearly, pCoolSsn, tWarmSsn,
    gsl_water_level, wildfire_acres };
}


// Global datasets
const globalAtmos = {
  metadata: null,
  tMonthly: null,
  pMonthly: null,
  tYearly: null,
  pYearly: null,
  pCoolSsn: null,
  tWarmSsn: null,
};

const hazards_resources = {
  gsl_water_level: [],
  wildfire_acres: [],
};

loadData().then((loadedData) => {

  // load in station, precip, and temperature data
  globalAtmos.metadata = loadedData.metadata;
  globalAtmos.tMonthly = loadedData.tMonthly;
  globalAtmos.pMonthly = loadedData.pMonthly;
  globalAtmos.tYearly = loadedData.tYearly;
  globalAtmos.pYearly = loadedData.pYearly;
  globalAtmos.pCoolSsn = loadedData.pCoolSsn;
  globalAtmos.tWarmSsn = loadedData.tWarmSsn;

  hazards_resources.gsl_water_level = loadedData.gsl_water_level;
  hazards_resources.wildfire_acres = loadedData.wildfire_acres;

  // create svg for map
  d3.select('#utah-map-div')
    .append('svg')
    .attr('width', MAP_WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', MAP_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr('id', 'utah-map-svg');

  // create div for monthly climo
  d3.select('#station-climo-div')
    .append('svg')
    .attr('width', CLIMO_WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', CLIMO_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr('id', 'monthly-climo-svg');

  d3.select('#station-climo-div')
    .append('svg')
    .attr('width', CLIMO_WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', CLIMO_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr('id', 'yearly-climo-svg');

  d3.select('#wf-temp-div')
    .append('svg')
    .attr('width', '100%')
    .attr('height', NHWR_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr('id', 'wf-temp-svg');

  d3.select('#gsl-precip-div')
    .append('svg')
    .attr('width', '100%')
    .attr('height', NHWR_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr('id', 'gsl-precip-svg');



  // call on functions to create default plots when the user enters page
  createMap(); // creates the utah map
  changeOG(); // creates the orographic gradient plot
  plotWildfire(); // plot wildfire data
  plotGSL(); // plot great salt lake data

  // put SLC as default
  updateStationClimo("SALT_LAKE_CITY_INTERNATIONAL_AIRPORT");

  // add listeners for any changes in the orographic gradient button
  const datatype = document.getElementById('dtype');
  datatype.addEventListener('change', changeOG);

  // add listener for resizing window
  //window.addEventListener('resize', function() {
  //  plotWildfire(); // plot wildfire data
  //  plotGSL(); // plot great salt lake data
  //});
});






  