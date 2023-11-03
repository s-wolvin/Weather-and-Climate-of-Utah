// plots the wildfire data
function plotWildfire() {
    // GET WIDTH OF SVG
    //const nhwr_width = d3.select("#gsl-precip-svg").node().getBoundingClientRect().width;
    const nhwr_width = NHWR_WIDTH;


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
        .range([0, nhwr_width-MARGIN.left])
        .domain(dataset.map((d) => d.year))
        .padding(0.2);

    svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, ${(NHWR_HEIGHT - MARGIN.bottom)})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ return !(i%2)})))
        .attr("id", "x-axis-wf")
        .attr("class", "x-axis");

    d3.select("#x-axis-wf").append("text")
        .attr("x", (nhwr_width-MARGIN.left)/2)
        .attr("y", 50)
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Years")
        .attr("class", "x-axis");

      // y-axis //
    const yScale = d3.scaleLinear()
      .range([NHWR_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(dataset.map((d) => +d.mTemp))*0.98, d3.max(dataset.map((d) => +d.mTemp))*1.02]);
  
    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("id", "y-axis-wf")
      .attr("class", "temp");
  
    d3.select("#y-axis-wf").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(NHWR_HEIGHT)/2)
      .attr("y", -MARGIN.left/1.5)
      .text("Yearly Average Temperature (?)")
      .attr("class", "temp");

    // circle radius scale //
    const rScale = d3.scaleLinear()
        .range([5, 40])
        .domain([d3.min(dataset.map((d) => +d.acres)), d3.max(dataset.map((d) => +d.acres))])

    // scatter chart
    chart = svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, -${MARGIN.bottom})`);

    // format for acres
    const format = d3.format(".2s");

    chart.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.year) + xScale.bandwidth()/2; })
        .attr("cy", function(d) { return yScale(d.mTemp); })
        .attr("r", function(d) { return rScale(d.acres); })
        .attr("class", "temp")
        .on('mouseover', function(event) { 
            this.classList.add('hover');

            let box = chart.append('rect')
                .attr('rx', 5)
                .attr('ry', 5);

            let tt = chart.append('text')
                .text(format(event.target.__data__.acres) + " Acres")
                .attr("x", xScale(event.target.__data__.year)-10)
                .attr("y", yScale(event.target.__data__.mTemp+((+this.getAttribute('r')+20)/100)))
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
            chart.select('#label-text').remove();
            chart.select('#label-rect').remove();
        });

}



// plot great salt lake data
function plotGSL() {
    // GET WIDTH OF SVG
    // const nhwr_width = d3.select("#gsl-precip-svg").node().getBoundingClientRect().width;
    const nhwr_width = NHWR_WIDTH;


    const yearNames = ['1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2003', 
    '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017',
    '2018', '2019', '2020', '2021', '2022'];

    // pull dates
    let gsl_water = hazards_resources.gsl_water_level;
    gsl_water.forEach(function(d) {
        d.date = d3.timeFormat("%b %Y")(new Date(d.year, d.month-1, 1));
    });

    console.log(gsl_water)

    // PLOT //
    let svg = d3.select("#gsl-precip-svg");

    console.log(svg)

    // x-axis //
    const xScale = d3.scalePoint()
        .range([0, nhwr_width - MARGIN.left - (MARGIN.right*3)])
        .domain(gsl_water.map((d) => d.date));

    svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, ${(NHWR_HEIGHT - MARGIN.bottom)})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ return !(i%25)})))
        .attr("id", "x-axis-gsl")
        .attr('class', 'x-axis');

    d3.select("#x-axis-gsl").append("text")
        .attr("x", (nhwr_width-MARGIN.left)/2)
        .attr("y", 50)
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Date")
        .attr('class', 'x-axis');

    // y-axis //
    const yScale = d3.scaleLinear()
      .range([NHWR_HEIGHT-MARGIN.bottom, MARGIN.top])
      .domain([d3.min(gsl_water.map((d) => +d.elev))*0.9998, d3.max(gsl_water.map((d) => +d.elev))*1.0002]);
  
    svg.append('g')
      .attr('transform', `translate(${nhwr_width-(MARGIN.right*3)}, 0)`)
      .call(d3.axisRight(yScale).ticks(5))
      .attr("id", "y-axis-gsl")
      .attr('class', 'x-axis');
  
    d3.select("#y-axis-gsl").append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(NHWR_HEIGHT)/2)
      .attr("y", MARGIN.left/0.75)
      .text("Water Elevation (meters)")
      .attr('class', 'x-axis');
  
    // svg
    let chart = svg.append('g')
        .attr('transform', `translate(${MARGIN.left}, 0)`);

    // line and scatter chart //
    chart.append("path")
        .datum(gsl_water)
        .attr("d", d3.line()
            .x(function(d) { return xScale(d.date) + xScale.bandwidth()/2; })
            .y(function(d) { return yScale(d.elev); }))
        .attr('class', 'gsl');
    

    // add follow line
    const vertGroup = svg.append('g')
    
    vertGroup.append('line')
        .attr('x1', MARGIN.left)
        .attr('x2', MARGIN.left)
        .attr('y1', MARGIN.top)
        .attr('y2', CHART_HEIGHT-MARGIN.bottom)
        .attr('class', 'gsl')
        .attr('id', 'vert-line');

    vertGroup.append('text')
        .attr('x', MARGIN.left)
        .attr('y', MARGIN.top*2)
        .attr('fill', '#d8d8d8')
        .style('font-size', '25px')
        .attr('id', 'vert-line-text');

    // formatting for text
    const format = d3.format(".5");

    d3.select("#gsl-precip-svg").on('mousemove', function (event) {
        let [xPos, yPos] = d3.pointer(event); // find mouse location

        if (xPos > MARGIN.left && xPos <= nhwr_width-(MARGIN.right*3)) {
            d3.select("#vert-line").attr('x1', xPos).attr('x2', xPos); // update line

            // pull the domain and range of xscale
            const domain = xScale.domain();
            const range = xScale.range();

            // create array with scalepoint steps
            let rangePoints = d3.range(range[0], range[1], xScale.step());

            // get correspoinding time
            let xDate = domain[d3.bisect(rangePoints, xPos-MARGIN.left)];

            // filter to find date
            const dateData = gsl_water.filter((d) => {return d.date === xDate;})

            // plot text
            if (xPos < (nhwr_width)/2) {
                d3.select('#vert-line-text')
                    .text(`${format(dateData[0].elev)} m`)
                    .attr('x', xPos+15)
                    .attr('y', 40)
                    .attr('text-anchor', 'start');
            } else {
                d3.select('#vert-line-text')
                    .text(`${format(dateData[0].elev)} m`)
                    .attr('x', xPos-15)
                    .attr('y', 40)
                    .attr('text-anchor', 'end');
            }

        }
    })



}