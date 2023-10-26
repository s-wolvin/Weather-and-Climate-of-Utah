// plots the wildfire data
function plotWildfire() {
    const yearNames = ['1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2003', 
        '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017',
        '2018', '2019', '2020', '2021', '2022'];


    let dataset = [];
    yearNames.forEach((year) => {
        let wf_year = hazards_resources.wildfire_acres.filter((d) => {return d.year === year})

        if (wf_year.length !== 0) {
            dataset.push({year: year, 
                mTemp: d3.mean(globalAtmos.tYearly.map((d) => {return d[year];})), 
                acres: wf_year[0].gisacres})
        }
    });


    console.log(dataset)
    // PLOT //
    const svg = d3.select("#wf-temp-svg");

    // x-axis //
    const xScale = d3.scaleBand()
        .range([0, NHWR_WIDTH-MARGIN.left])
        .domain(dataset.map((d) => d.year))
        .padding(0.2);

    svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, ${(NHWR_HEIGHT - MARGIN.bottom)})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ return !(i%2)})))
        .attr("id", "x-axis-wf");

    d3.select("#x-axis-wf").append("text")
        .attr("x", (NHWR_WIDTH-MARGIN.left)/2)
        .attr("y", 50)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "20px")
        .text("Years");

      // y-axis //
    const yScale = d3.scaleLinear()
      .range([NHWR_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(dataset.map((d) => +d.mTemp))*0.98, d3.max(dataset.map((d) => +d.mTemp))*1.02]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("id", "y-axis-wf");
  
    d3.select("#y-axis-wf").append("text")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(NHWR_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Yearly Average Temperature (?)")
      .attr("class", "wf");

    // circle radius scale //
    const rScale = d3.scaleLinear()
        .range([5, 20])
        .domain([d3.min(dataset.map((d) => +d.acres)), d3.max(dataset.map((d) => +d.acres))])

    // scatter chart
    chart = svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);

    chart.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.year) + xScale.bandwidth()/2; })
        .attr("cy", function(d) { return yScale(d.mTemp); })
        .attr("r", function(d) { return rScale(d.acres); })
        .attr("class", "temp");
    

}


// plot great salt lake data
function plotGSL() {
    const yearNames = ['1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2003', 
    '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017',
    '2018', '2019', '2020', '2021', '2022'];

    console.log(hazards_resources.gsl_water_level)

    // pull dates
    let gsl_water = hazards_resources.gsl_water_level;
    gsl_water.forEach(function(d) {
        d.date = d3.timeFormat("%m-%Y")(new Date(d.year, d.month-1, 1));
    });

    console.log(gsl_water)

    // PLOT //
    let svg = d3.select("#gsl-precip-svg");

    // x-axis //
    const xScale = d3.scalePoint()
        .range([0, NHWR_WIDTH - MARGIN.left - MARGIN.right])
        .domain(gsl_water.map((d) => d.date));

    svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, ${(NHWR_HEIGHT - MARGIN.bottom)})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .attr("id", "x-axis-gsl");

    d3.select("#x-axis-gsl").append("text")
        .attr("x", (NHWR_WIDTH-MARGIN.left)/2)
        .attr("y", 50)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "20px")
        .text("Date");

    // y-axis //
    const yScale = d3.scaleLinear()
      .range([NHWR_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(gsl_water.map((d) => +d.elev))*0.9999, d3.max(gsl_water.map((d) => +d.elev))*1.0001]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("id", "y-axis-gsl");
  
    d3.select("#y-axis-gsl").append("text")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(NHWR_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Water Elevation");
  
    // svg
    let chart = svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);

        // line and scatter chart //
    chart.append("path")
        .datum(gsl_water)
        .attr("d", d3.line()
            .x(function(d) { return xScale(d.date) + xScale.bandwidth()/2; })
            .y(function(d) { return yScale(d.elev); }))
        .attr('class', 'gsl');
    


}