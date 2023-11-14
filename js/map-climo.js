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

        let data = globalAtmos.metadata.filter((d) => d.NAME === event.target.__data__.NAME)[0];
        let name = data.HEADER;
        let latlon       = `${(+data.LATITUDE).toFixed(2)}°N, ${(+data.LONGITUDE).toFixed(2)}°W`;
        let elevation    = `Elevation: ${Math.round(data.ELEVATION)} meters`;
        let combinedText = `${name}\n${latlon}\n${elevation}`;

        let xOffset = name.length / 50;
        let yOffset = 0.5;

        // add text to teh dots, postiton based on location on map to prevent the name from being cut off
        if (event.target.__data__.LONGITUDE > -111.0937) {
          let box = scatter.append('rect')
            .attr("rx", 5)
            .attr("ry", 5);

          let tt = scatter.append('text')
          //.text(combinedText)
          .attr("x", projection([+event.target.__data__.LONGITUDE - xOffset, +event.target.__data__.LATITUDE + yOffset])[0])
          .attr("y", projection([+event.target.__data__.LONGITUDE - xOffset, +event.target.__data__.LATITUDE + yOffset])[1])
          .style("text-anchor", "middle")
          .attr('id', 'label-text')
          // Adjust the vertical position to center the text

          const lines = combinedText.split('\n');
          tt.selectAll('tspan')
            .data(lines)
            .enter()
            .append('tspan')
            .text(d => d)
            .attr('x', tt.attr('x'))
            .attr('dy', (d, i) => i === 0 ? '0' : '1.1em');
      
          box.attr('width', tt.node().getBBox().width + 14)
            .attr('height', tt.node().getBBox().height + 4)
            .attr('x', tt.node().getBBox().x - 7)
            .attr('y', tt.node().getBBox().y - 3)
            .attr('id', 'label-rect');

        } else {
          let box = scatter.append('rect')
            .attr("rx", 5)
            .attr("ry", 5);

          let tt = scatter.append('text')
            .text(globalAtmos.metadata.filter((d) => {return d.NAME === event.target.__data__.NAME})[0].HEADER)
            .attr("x", projection([+event.target.__data__.LONGITUDE+(name.length/50), +event.target.__data__.LATITUDE+yOffset])[0])
            .attr("y", projection([+event.target.__data__.LONGITUDE+(name.length/50), +event.target.__data__.LATITUDE+yOffset])[1])
            .style("text-anchor", "middle")
            .attr('id', 'label-text');

          const lines = combinedText.split('\n');
          tt.selectAll('tspan')
            .data(lines)
            .enter()
            .append('tspan')
            .text(d => d)
            .attr('x', tt.attr('x'))
            .attr('dy', (d, i) => i === 0 ? '0' : '1.1em');

          box.attr('width', tt.node().getBBox().width+14)
            .attr('height', tt.node().getBBox().height+4)
            .attr('x', tt.node().getBBox().x-7)
            .attr('y', tt.node().getBBox().y-3)
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
    const xScaleMonth = d3.scaleBand()
      .range([0, CLIMO_WIDTH-MARGIN.left])
      .domain(pMonthly.map((d) => d.month))
      .padding(0.2);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, ${(CLIMO_HEIGHT - MARGIN.bottom)})`)
      .call(d3.axisBottom(xScaleMonth))
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
    const yScalePrMonth = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([0, d3.max(pMonthly.map((d) => +d.value))*1.1]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScalePrMonth).ticks(5))
      .attr("id", "y-axis-monthly-pr")
      .attr("class", "precip");
  
    d3.select("#y-axis-monthly-pr").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Average Precipitation (inch)")
      .attr("class", "precip");
  
    const yScaleTMonth = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(tMonthly.map((d) => +d.value))*0.75, d3.max(tMonthly.map((d) => +d.value))*1.25]);
  
    svg.append('g')
      .attr('transform', `translate(${CLIMO_WIDTH}, 0)`)
      .call(d3.axisRight(yScaleTMonth).ticks(5))
      .attr("id", "y-axis-monthly-t")
      .attr("class", "temp");
  
    d3.select("#y-axis-monthly-t").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(90)")
      .attr("x", (CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Average Temperature (°F)")
      .attr("class", "temp");
  
    // bar chart //
    let chart_monthly = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);

    const bars_monthly = chart_monthly.selectAll("rect")
    .data(pMonthly);
    
    bars_monthly.exit()
      .transition()
      .duration(1000)
      .attr("height", 0)
      .remove();
    
    bars_monthly.enter()
      .append("rect")
      .attr("x", function(d) { return xScaleMonth(d.month); })
      .attr("y", CLIMO_HEIGHT - MARGIN.bottom) // Start at the bottom
      .attr("width", xScaleMonth.bandwidth())
      .attr("height", 0) // Start with height 0 for animation
      .attr("class", "precip")
      .merge(bars_monthly)
      .transition() // Add a transition to smoothly update bars
      .duration(1000)
      .attr("y", function(d) { return yScalePrMonth(+d.value) + MARGIN.top; })
      .attr("height", function(d) { return CLIMO_HEIGHT - yScalePrMonth(+d.value) - MARGIN.top; })
      .on("end", function() {
        // Add mouseover interaction here
        d3.select(this)
          .on('mouseover', function(event) { 
            this.classList.add('hover');
    
            let box = chart_monthly.append('rect')
              .attr('rx', 5)
              .attr('ry', 5);
    
            let tt = chart_monthly.append('text')
              .text(`${d3.format('.2f')(event.target.__data__.value)} inch`)
              .attr("x", xScaleMonth(event.target.__data__.month) - 8)
              .attr("y", yScalePrMonth(event.target.__data__.value))
              .style("text-anchor", "start")
              .attr('id', 'label-text');
    
            box.attr('width', tt.node().getBBox().width + 14)
              .attr('height', tt.node().getBBox().height + 4)
              .attr('x', tt.node().getBBox().x - 7)
              .attr('y', tt.node().getBBox().y - 2)
              .attr('id', 'label-rect');
          })
          .on('mouseout', function() { 
            this.classList.remove('hover');
    
            chart_monthly.select('#label-text').remove();
            chart_monthly.select('#label-rect').remove();
          });
      });
    // line and scatter chart //
    const linePath_monthly = chart_monthly.append("path")
      .datum(tMonthly)
      .attr("d", d3.line()
        .x(function(d) { return xScaleMonth(d.month) + xScaleMonth.bandwidth() / 2; })
        .y(function(d) { return yScaleTMonth(d.value); }))
      .attr('class', 'temp');

    // Add transitions to the line chart
    linePath_monthly
      .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); })
      .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);

    chart_monthly.selectAll("circle")
      .data(tMonthly)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScaleMonth(d.month) + xScaleMonth.bandwidth() / 2; })
      .attr("cy", CLIMO_HEIGHT - MARGIN.bottom) // Start at the bottom
      .attr("r", 13)
      .attr("class", "temp")
      .merge(chart_monthly.selectAll("circle"))
      .transition()
      .duration(1000)
      .attr("cy", function(d) { return yScaleTMonth(d.value); });

    // Add mouseover interaction to the circles
    chart_monthly.selectAll("circle")
      .on('mouseover', function(event) {
        this.classList.add('hover');

        let box = chart_monthly.append('rect')
          .attr('rx', 5)
          .attr('ry', 5);

        let tt = chart_monthly.append('text')
          .text(`${d3.format('.1f')(event.target.__data__.value)} °F`)
          .attr("x", xScaleMonth(event.target.__data__.month) - 3)
          .attr("y", yScaleTMonth(event.target.__data__.value + 8))
          .style("text-anchor", "start")
          .attr('id', 'label-text');

        box.attr('width', tt.node().getBBox().width + 14)
          .attr('height', tt.node().getBBox().height + 4)
          .attr('x', tt.node().getBBox().x - 7)
          .attr('y', tt.node().getBBox().y - 2)
          .attr('id', 'label-rect');
      })
      .on('mouseout', function() {
        this.classList.remove('hover');

        chart_monthly.select('#label-text').remove();
        chart_monthly.select('#label-rect').remove();
      });
  
  
  
    // YEARLY CLIMO
    svg = d3.select("#yearly-climo-svg");
    svg.selectAll('*').remove();
  
    // x-axis //
    const xScaleYear = d3.scaleBand()
      .range([0, CLIMO_WIDTH-MARGIN.left])
      .domain(pYearly.map((d) => d.year))
      .padding(0.2);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, ${(CLIMO_HEIGHT - MARGIN.bottom)})`)
      .call(d3.axisBottom(xScaleYear).tickValues(xScaleYear.domain().filter(function(d,i){ return !(i%3)})))
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
    const yScalePrYear = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([0, d3.max(pYearly.map((d) => +d.value))*1.1]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScalePrYear).ticks(5))
      .attr("id", "y-axis-yearly-pr")
      .attr("class", "precip");
  
    d3.select("#y-axis-yearly-pr").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Total Precipitation (inch)")
      .attr("class", "precip");
  
    const yScaleTYear = d3.scaleLinear()
      .range([CLIMO_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(tYearly.map((d) => +d.value))*0.95, d3.max(tYearly.map((d) => +d.value))*1.05]);
  
    svg.append('g')
      .attr('transform', `translate(${CLIMO_WIDTH}, 0)`)
      .call(d3.axisRight(yScaleTYear).ticks(5))
      .attr("id", "y-axis-yearly-t")
      .attr("class", "temp");
  
    d3.select("#y-axis-yearly-t").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(90)")
      .attr("x", (CLIMO_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Average Temperature (°F)")
      .attr("class", "temp");
  
    // bar chart
    chart_yearly = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);

    const bars_yearly = chart_yearly.selectAll("rect").data(pYearly);

    bars_yearly.exit()
    .transition()
    .duration(1000)
    .attr("height", 0)
    .remove();

    bars_yearly.enter()
    .append("rect")
    .attr("x", function(d) { return xScaleYear(d.year); })
    .attr("y", CLIMO_HEIGHT - MARGIN.bottom) // Start at the bottom
    .attr("width", xScaleYear.bandwidth())
    .attr("height", 0) // Start with height 0 for animation
    .attr("class", "precip")
    .merge(bars_yearly)
    .transition() // Add a transition to smoothly update bars
    .duration(1000)
    .attr("y", function(d) { return yScalePrYear(+d.value) + MARGIN.top; })
    .attr("height", function(d) { return CLIMO_HEIGHT - yScalePrYear(+d.value) - MARGIN.top; })
    .on("end", function() {
         // Add mouseover interaction here
         d3.select(this)
         .on('mouseover', function(event) { 
           this.classList.add('hover');
   
           let box = chart_yearly.append('rect')
             .attr('rx', 5)
             .attr('ry', 5);
   
           let tt = chart_yearly.append('text')
             .text(`${d3.format('.2f')(event.target.__data__.value)} inch`)
             .attr("x", xScaleYear(event.target.__data__.year) - 8)
             .attr("y", yScalePrYear(event.target.__data__.value))
             .style("text-anchor", "start")
             .attr('id', 'label-text');
   
           box.attr('width', tt.node().getBBox().width + 14)
             .attr('height', tt.node().getBBox().height + 4)
             .attr('x', tt.node().getBBox().x - 7)
             .attr('y', tt.node().getBBox().y - 2)
             .attr('id', 'label-rect');
         })
         .on('mouseout', function() { 
           this.classList.remove('hover');
   
           chart_yearly.select('#label-text').remove();
           chart_yearly.select('#label-rect').remove();
         });
     });

    // line and scatter chart //
    const linePath_yearly = chart_yearly.append("path")
    .datum(tYearly)
    .attr("d", d3.line()
      .x(function(d) { return xScaleYear(d.year) + xScaleYear.bandwidth() / 2; })
      .y(function(d) { return yScaleTYear(d.value); }))
    .attr('class', 'temp');

    // Add transitions to the line chart
    linePath_yearly
    .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); })
    .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
    .transition()
    .duration(1000)
    .attr("stroke-dashoffset", 0);
  
    chart_yearly.selectAll("circle")
    .data(tYearly)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScaleYear(d.year) + xScaleYear.bandwidth() / 2; })
    .attr("cy", CLIMO_HEIGHT - MARGIN.bottom) // Start at the bottom
    .attr("r", 9)
    .attr("class", "temp")
    .merge(chart_yearly.selectAll("circle"))
    .transition()
    .duration(1000)
    .attr("cy", function(d) { return yScaleTYear(d.value); });

    // Add mouseover interaction to the circles
    chart_yearly.selectAll("circle")
      .on('mouseover', function(event) {
        this.classList.add('hover');

        let box = chart_yearly.append('rect')
          .attr('rx', 5)
          .attr('ry', 5);

        let tt = chart_yearly.append('text')
          .text(`${d3.format('.1f')(event.target.__data__.value)} °F`)
          .attr("x", xScaleYear(event.target.__data__.year) - 3)
          .attr("y", yScaleTYear(event.target.__data__.value + 8))
          .style("text-anchor", "start")
          .attr('id', 'label-text');

        box.attr('width', tt.node().getBBox().width + 14)
          .attr('height', tt.node().getBBox().height + 4)
          .attr('x', tt.node().getBBox().x - 7)
          .attr('y', tt.node().getBBox().y - 2)
          .attr('id', 'label-rect');
      })
      .on('mouseout', function() {
        this.classList.remove('hover');

        chart_yearly.select('#label-text').remove();
        chart_yearly.select('#label-rect').remove();
      });
    
  }