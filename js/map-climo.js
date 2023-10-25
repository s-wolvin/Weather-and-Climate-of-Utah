// function to create interactive utah map
function createMap () {

    // select svg
    const mapSVG = d3.select('#utah-map-svg');
    const map = mapSVG.append("g");
    const scatter = mapSVG.append("g").attr("id", "station-scatter");
  
    let projection = d3.geoConicEqualArea()
      .rotate([110,0])
      .translate([340,1025])
      .scale(6000)
  
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
      .attr("r", 6)
      .style("fill", "black")
      .attr('id', d => {return d.NAME; })
      .on('click', d => {updateStationClimo(d.target.id); })
      .on('mouseover', function(event) {
        scatter.append('text')
          .text(globalAtmos.metadata.filter((d) => {return d.NAME === event.target.__data__.NAME})[0].HEADER)
          .style("fill", "black")
          .attr("x", projection([+event.target.__data__.LONGITUDE, +event.target.__data__.LATITUDE+0.1])[0])
          .attr("y", projection([+event.target.__data__.LONGITUDE, +event.target.__data__.LATITUDE+0.1])[1])
          .style("text-anchor", "middle");
  
          d3.select(event.target).attr("r", 10);
      }) // increases size during hover
      .on('mouseout', d => {
        scatter.selectAll('text').remove();
        
        d3.select(d.target).attr("r", 6)
      }); // decreases size after hover
  
  }
  
  // function to organize data
  function orgMonthly (data) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataset = [];
    
    for (i=0; i < monthNames.length; i++) {
      dataset.push({month: monthNames[i], value: +data[0][monthNames[i]]});
    }
  
    return dataset
  }
  
  // function to organize data
  function orgYearly (data) {
    const yearNames = [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2003, 
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017,
      2018, 2019, 2020, 2021, 2022];
    const dataset = [];
    
    for (i=0; i < yearNames.length; i++) {
      dataset.push({year: yearNames[i], value: +data[0][yearNames[i]]});
    }
  
    return dataset
  }
  
  
  
  // function for updating the station climatology next to the map based on named passed
  function updateStationClimo (name) {
    // pull desired data
    const pMonthly = orgMonthly(globalAtmos.pMonthly.filter((d) => {return d.NAME === name}));
    const tMonthly = orgMonthly(globalAtmos.tMonthly.filter((d) => {return d.NAME === name}));
    const pYearly = orgYearly(globalAtmos.pYearly.filter((d) => {return d.NAME === name}));
    const tYearly = orgYearly(globalAtmos.tYearly.filter((d) => {return d.NAME === name}));
  
    // append to title
    const header = document.getElementById("station-name");
    header.innerHTML = globalAtmos.metadata.filter((d) => {return d.NAME === name})[0].HEADER;
  
    // MONTHLY CLIMO
    let svg = d3.select("#monthly-climo-svg");
    svg.selectAll('*').remove();
  
    // x-axis //
    let xScale = d3.scaleBand()
      .range([0, CLIMO_WIDTH-MARGIN.left])
      .domain(pMonthly.map((d) => d.month))
      .padding(0.2);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, ${(CLIMO_HEIGHT - MARGIN.bottom)})`)
      .call(d3.axisBottom(xScale))
      .attr("id", "x-axis-monthly");
  
    d3.select("#x-axis-monthly").append("text")
      .attr("x", (CLIMO_WIDTH-MARGIN.left)/2)
      .attr("y", 50)
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .text("Months");
  
    // y-axis //
    let yScalePr = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([0, d3.max(pMonthly.map((d) => +d.value))*1.1]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScalePr).ticks(5))
      .attr("id", "y-axis-monthly-pr");
  
    d3.select("#y-axis-monthly-pr").append("text")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Total Precipitation (mm)")
      .attr("class", "precip");
  
    let yScaleT = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(tMonthly.map((d) => +d.value))*0.75, d3.max(tMonthly.map((d) => +d.value))*1.25]);
  
    svg.append('g')
      .attr('transform', `translate(${CLIMO_WIDTH}, 0)`)
      .call(d3.axisRight(yScaleT).ticks(5))
      .attr("id", "y-axis-monthly-t");
  
    d3.select("#y-axis-monthly-t").append("text")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .attr("transform", "rotate(90)")
      .attr("x", (CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Average Temperature (F)")
      .attr("class", "temp");
  
    // bar chart //
    let chart = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);
  
    chart.selectAll("rect")
      .data(pMonthly)
      .enter()
      .append("rect")
      .attr("x", function(d) { return xScale(d.month); })
      .attr("y", function(d) { return yScalePr(+d.value) + MARGIN.top; })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return CLIMO_HEIGHT - yScalePr(+d.value) - MARGIN.top; })
      .attr("class", "precip");
  
    // line and scatter chart //
    chart.append("path")
      .datum(tMonthly)
      .attr("d", d3.line()
        .x(function(d) { return xScale(d.month) + xScale.bandwidth()/2; })
        .y(function(d) { return yScaleT(d.value); }))
      .attr('class', 'temp');
  
    chart.selectAll("circle")
      .data(tMonthly)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScale(d.month) + xScale.bandwidth()/2; })
      .attr("cy", function(d) { return yScaleT(d.value); })
      .attr("r", 8)
      .attr("class", "temp");
  
  
  
    // YEARLY CLIMO
    svg = d3.select("#yearly-climo-svg");
    svg.selectAll('*').remove();
  
    // x-axis //
    xScale = d3.scaleBand()
      .range([0, CLIMO_WIDTH-MARGIN.left])
      .domain(pYearly.map((d) => d.year))
      .padding(0.2);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, ${(CLIMO_HEIGHT - MARGIN.bottom)})`)
      .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ return !(i%2)})))
      .attr("id", "x-axis-yearly");
  
    d3.select("#x-axis-yearly").append("text")
      .attr("x", (CLIMO_WIDTH-MARGIN.left)/2)
      .attr("y", 50)
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .text("Years");
  
      // y-axis //
    yScalePr = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([0, d3.max(pYearly.map((d) => +d.value))*1.1]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScalePr).ticks(5))
      .attr("id", "y-axis-yearly-pr");
  
    d3.select("#y-axis-yearly-pr").append("text")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Total Precipitation (mm)")
      .attr("class", "precip");
  
    yScaleT = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(tYearly.map((d) => +d.value))*0.95, d3.max(tYearly.map((d) => +d.value))*1.05]);
  
    svg.append('g')
      .attr('transform', `translate(${CLIMO_WIDTH}, 0)`)
      .call(d3.axisRight(yScaleT).ticks(5))
      .attr("id", "y-axis-yearly-t");
  
    d3.select("#y-axis-yearly-t").append("text")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .attr("transform", "rotate(90)")
      .attr("x", (CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Average Temperature (F)")
      .attr("class", "temp");
  
    // bar chart
    chart = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);
  
    chart.selectAll("rect")
      .data(pYearly)
      .enter()
      .append("rect")
      .attr("x", function(d) { return xScale(d.year); })
      .attr("y", function(d) { return yScalePr(+d.value) + MARGIN.top; })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return CLIMO_HEIGHT - yScalePr(+d.value) - MARGIN.top; })
      .attr("class", "precip");
  
    chart.append("path")
      .datum(tYearly)
      .attr("d", d3.line()
        .x(function(d) { return xScale(d.year) + xScale.bandwidth()/2; })
        .y(function(d) { return yScaleT(d.value); }))
      .attr("class", "temp");
  
    chart.selectAll("circle")
      .data(tYearly)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScale(d.year) + xScale.bandwidth()/2; })
      .attr("cy", function(d) { return yScaleT(d.value); })
      .attr("r", 8)
      .attr("class", "temp");
  
  }