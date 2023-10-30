// function to create interactive utah map
function createMap () {

    // select svg
    const mapSVG = d3.select('#utah-map-svg');
    const map = mapSVG.append("g");
    const scatter = mapSVG.append("g").attr("id", "station-scatter");
  
    let projection = d3.geoConicConformal()
      .center([-111, 39])
      .rotate([111,0])
      .translate([-7730,-3850])
      .scale(6200)
 
    //let projection = d3.geoConicEqualArea()
    //  .rotate([110,0])
    //  .translate([340,1025])
    //  .scale(6000)
  
    const generator = d3.geoPath().projection(projection);  
  
    // Loads external data and plot map
    d3.json("data/gz_2010_us_states_20m.json").then( function(data) {
  
      // this plots the map borders
      map.selectAll("path")
        .data(data.features)
        .join("path")
        .attr("d", generator)
        .attr('stroke', '#2b2b2b')
        .attr('stroke-width', 2)
        .attr('fill', '#bcafc9');
  
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

        let name = globalAtmos.metadata.filter((d) => {return d.NAME === event.target.__data__.NAME})[0].HEADER;

        // add text to teh dots, postiton based on location on map to prevent the name from being cut off
        if (event.target.__data__.LONGITUDE > -111.0937) {
          let box = scatter.append('rect')
            .attr("rx", 5)
            .attr("ry", 5);

          let tt = scatter.append('text')
            .text(name)
            .attr("x", projection([+event.target.__data__.LONGITUDE-(name.length/50), +event.target.__data__.LATITUDE+0.17])[0])
            .attr("y", projection([+event.target.__data__.LONGITUDE-(name.length/50), +event.target.__data__.LATITUDE+0.17])[1])
            .style("text-anchor", "middle")
            .attr('id', 'label-text');

          box.attr('width', tt.node().getBBox().width+14)
            .attr('height', tt.node().getBBox().height+4)
            .attr('x', tt.node().getBBox().x-7)
            .attr('y', tt.node().getBBox().y-2)
            .attr('id', 'label-rect');


          
        } else {
          let box = scatter.append('rect')
            .attr("rx", 5)
            .attr("ry", 5);

          let tt = scatter.append('text')
            .text(globalAtmos.metadata.filter((d) => {return d.NAME === event.target.__data__.NAME})[0].HEADER)
            .attr("x", projection([+event.target.__data__.LONGITUDE+(name.length/50), +event.target.__data__.LATITUDE+0.17])[0])
            .attr("y", projection([+event.target.__data__.LONGITUDE+(name.length/50), +event.target.__data__.LATITUDE+0.17])[1])
            .style("text-anchor", "middle")
            .attr('id', 'label-text');

          box.attr('width', tt.node().getBBox().width+14)
            .attr('height', tt.node().getBBox().height+4)
            .attr('x', tt.node().getBBox().x-7)
            .attr('y', tt.node().getBBox().y-2)
            .attr('id', 'label-rect');
        }
  
        d3.select(event.target).attr("r", 10);


      }) // increases size during hover
      .on('mouseout', d => {
        scatter.select('#label-text').remove();
        scatter.select('#label-rect').remove();
        
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
      .attr("id", "x-axis-monthly")
      .attr("class", "x-axis");
  
    d3.select("#x-axis-monthly").append("text")
      .attr("x", (CLIMO_WIDTH-MARGIN.left)/2)
      .attr("y", 50)
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .text("Months")
      .attr("class", "x-axis");
  
    // y-axis //
    let yScalePr = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([0, d3.max(pMonthly.map((d) => +d.value))*1.1]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScalePr).ticks(5))
      .attr("id", "y-axis-monthly-pr")
      .attr("class", "precip");
  
    d3.select("#y-axis-monthly-pr").append("text")
      .style("text-anchor", "middle")
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
      .attr("id", "y-axis-monthly-t")
      .attr("class", "temp");
  
    d3.select("#y-axis-monthly-t").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(90)")
      .attr("x", (CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Average Temperature (F)")
      .attr("class", "temp");
  
    // bar chart //
    let chart_monthly = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);
  
      chart_monthly.selectAll("rect")
      .data(pMonthly)
      .enter()
      .append("rect")
      .attr("x", function(d) { return xScale(d.month); })
      .attr("y", function(d) { return yScalePr(+d.value) + MARGIN.top; })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return CLIMO_HEIGHT - yScalePr(+d.value) - MARGIN.top; })
      .attr("class", "precip")
      .on('mouseover', function(event) { 
        this.classList.add('hover')
      
        let box = chart_monthly.append('rect')
          .attr('rx', 5)
          .attr('ry', 5)

        let tt = chart_monthly.append('text')
            .text(`${event.target.__data__.value} mm?`)
            .attr("x", xScale(event.target.__data__.month))
            .attr("y", yScalePr(event.target.__data__.value))
            .style("text-anchor", "start")
            .attr('id', 'label-text');

        box.attr('width', tt.node().getBBox().width+14)
            .attr('height', tt.node().getBBox().height+4)
            .attr('x', tt.node().getBBox().x-7)
            .attr('y', tt.node().getBBox().y-2)
            .attr('id', 'label-rect');
      })
      .on('mouseout', function() { 
        this.classList.remove('hover');

        chart_monthly.select('#label-text').remove();
        chart_monthly.select('#label-rect').remove();
      });
  
    // line and scatter chart //
    chart_monthly.append("path")
      .datum(tMonthly)
      .attr("d", d3.line()
        .x(function(d) { return xScale(d.month) + xScale.bandwidth()/2; })
        .y(function(d) { return yScaleT(d.value); }))
      .attr('class', 'temp');
  
    chart_monthly.selectAll("circle")
      .data(tMonthly)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScale(d.month) + xScale.bandwidth()/2; })
      .attr("cy", function(d) { return yScaleT(d.value); })
      .attr("r", 10)
      .attr("class", "temp")
      .on('mouseover', function() { this.classList.add('hover') })
      .on('mouseout', function() { this.classList.remove('hover')});
  
  
  
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
      .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ return !(i%3)})))
      .attr("id", "x-axis-yearly")
      .attr("class", "x-axis");
  
    d3.select("#x-axis-yearly").append("text")
      .attr("x", (CLIMO_WIDTH-MARGIN.left)/2)
      .attr("y", 50)
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .text("Years")
      .attr("class", "x-axis");
  
      // y-axis //
    yScalePr = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([0, d3.max(pYearly.map((d) => +d.value))*1.1]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScalePr).ticks(5))
      .attr("id", "y-axis-yearly-pr")
      .attr("class", "precip");
  
    d3.select("#y-axis-yearly-pr").append("text")
      .style("text-anchor", "middle")
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
      .attr("id", "y-axis-yearly-t")
      .attr("class", "temp");
  
    d3.select("#y-axis-yearly-t").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(90)")
      .attr("x", (CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Average Temperature (F)")
      .attr("class", "temp");
  
    // bar chart
    chart_yearly = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);
  
    chart_yearly.selectAll("rect")
      .data(pYearly)
      .enter()
      .append("rect")
      .attr("x", function(d) { return xScale(d.year); })
      .attr("y", function(d) { return yScalePr(+d.value) + MARGIN.top; })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return CLIMO_HEIGHT - yScalePr(+d.value) - MARGIN.top; })
      .attr("class", "precip")
      .on('mouseover', function(event) { 
        this.classList.add('hover');
      
        let box = chart_yearly.append('rect')
          .attr('rx', 5)
          .attr('ry', 5)

        let tt = chart_yearly.append('text')
            .text(`${event.target.__data__.value} mm?`)
            .attr("x", xScale(event.target.__data__.month))
            .attr("y", yScalePr(event.target.__data__.value))
            .style("text-anchor", "start")
            .attr('id', 'label-text');

        box.attr('width', tt.node().getBBox().width+14)
            .attr('height', tt.node().getBBox().height+4)
            .attr('x', tt.node().getBBox().x-7)
            .attr('y', tt.node().getBBox().y-2)
            .attr('id', 'label-rect');
          })
      .on('mouseout', function() { 
        this.classList.remove('hover');
      
        chart_yearly.select('#label-text').remove();
        chart_yearly.select('#label-rect').remove();
      });
  
    chart_yearly.append("path")
      .datum(tYearly)
      .attr("d", d3.line()
        .x(function(d) { return xScale(d.year) + xScale.bandwidth()/2; })
        .y(function(d) { return yScaleT(d.value); }))
      .attr("class", "temp");
  
    chart_yearly.selectAll("circle")
      .data(tYearly)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScale(d.year) + xScale.bandwidth()/2; })
      .attr("cy", function(d) { return yScaleT(d.value); })
      .attr("r", 8)
      .attr("class", "temp")
      .on('mouseover', function() { this.classList.add('hover') })
      .on('mouseout', function() { this.classList.remove('hover')});
  
  }