function changeOG () {
    // pull value of orographic gradient dataset
    const dataFile = d3.select('#dtype').property('value');

    // formulate the size of the plots
    const panelMARGIN = 30;
    const panelWidth = (GRAD_WIDTH/2) - panelMARGIN*2;
    const panelHeight = (GRAD_HEIGHT/2) - panelMARGIN*2;
    const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
  
    // pull desired dataset
    let gradset = [];
    let y_axis_text = [];
    if (dataFile === 'precip') {
      gradset = globalAtmos.pSeasonal;
      y_axis_text = 'Seasonal Total Precipitation (inch)';
    } else if (dataFile === 'temp') {
      gradset = globalAtmos.tSeasonal;
      y_axis_text = 'Seasonal Average Temperature (°F)';
    }

    // plot orographic gradients
    // select svg
    const svg = d3.select("#grad-svg");

    // remove all previous plot stuff
    svg.selectAll('*').remove();

    // SETTING THE AXIES //
    const xScale = d3.scaleLinear()
      .range([0,panelWidth])
      .domain([d3.min(globalAtmos.metadata.map(d => +d.ELEVATION)),
        d3.max(globalAtmos.metadata.map(d => +d.ELEVATION))]);

    const yScale = d3.scaleLinear()
      .range([panelHeight, 0])
      .domain([d3.min([d3.min(gradset.map((d) => +d.Fall)), d3.min(gradset.map((d) => +d.Winter)), 
        d3.min(gradset.map((d) => +d.Spring)), d3.min(gradset.map((d) => +d.Summer))]), 
        d3.max([d3.max(gradset.map((d) => +d.Fall)), d3.max(gradset.map((d) => +d.Winter)), 
          d3.max(gradset.map((d) => +d.Spring)), d3.max(gradset.map((d) => +d.Summer))])]);

    // ADD LABELS TO OUTER MARGINS //
    svg.append("text")
      .attr("x", (GRAD_WIDTH)/2+MARGIN.left)
      .attr("y", GRAD_HEIGHT+MARGIN.top+MARGIN.bottom-5)
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .text("Elevation (meters)")
      .attr("class", "x-axis");

    svg.append("text")
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .attr("transform", "rotate(-90)")
      .attr("x", -(GRAD_HEIGHT)/2)
      .attr("y", MARGIN.left/1.5)
      .text(y_axis_text)
      .attr("class", `${dataFile}`);


    plotPanel(svg, gradset, 'Winter', MARGIN.left+panelMARGIN, MARGIN.top+panelMARGIN+panelHeight, panelWidth, panelHeight, xScale, yScale, dataFile);
    plotPanel(svg, gradset, 'Spring', MARGIN.left+(panelMARGIN*3)+panelWidth, MARGIN.top+panelMARGIN+panelHeight, panelWidth, panelHeight, xScale, yScale, dataFile);
    plotPanel(svg, gradset, 'Summer', MARGIN.left+panelMARGIN, MARGIN.top+(panelMARGIN*3)+(panelHeight*2), panelWidth, panelHeight, xScale, yScale, dataFile);
    plotPanel(svg, gradset, 'Fall', MARGIN.left+(panelMARGIN*3)+panelWidth, MARGIN.top+(panelMARGIN*3)+(panelHeight*2), panelWidth, panelHeight, xScale, yScale, dataFile);
  
  }




function plotPanel(svg, gradset, season, x, y, panelWidth, panelHeight, xScale, yScale, dataFile) {
  // APPEND AXES //
  svg.append('g')
    .attr('transform', `translate(${x}, ${y})`)
    .call(d3.axisBottom(xScale).ticks(3))
    .attr("id", `x-axis-grad-${season}`)
    .attr("class", "x-axis");

  svg.append('g')
    .attr('transform', `translate(${x}, ${y-panelHeight})`)
    .call(d3.axisLeft(yScale).ticks(5))
    .attr("id", `y-axis-grad-${season}`)
    .attr("class", dataFile);

  // ADD TITLE //
  svg.append("text")
    .attr("x", x+(panelWidth/2))
    .attr("y", y-(panelHeight))
    .style("text-anchor", "middle")
    .style("font-size", "25px")
    .text(season)
    .attr("class", "x-axis");

  // label formatting
  let frmt = d3.format('.1f');

  // APPEND SCATTER PLOT //
  let chart = svg.append('g')
    .attr('transform', `translate(${x}, ${y})`);

  chart.selectAll("circle")
    .data(gradset)
    .enter()
    .append('circle')
    .attr("cx", function(d) { return xScale(d.ELEVATION) })
    .attr("cy", function(d) { return yScale(d[`${season}`]) - panelHeight})
    .attr("r", 6)
    .attr("class", dataFile)
    .on('mouseover', function(event) {
      this.classList.add('hover');
      d3.select(event.target).attr("r", 10);

      let data = globalAtmos.metadata.filter((d) => d.NAME === event.target.__data__.NAME)[0];
      let name = data.HEADER;
      let value = [];
      if (dataFile === 'precip') {
        value       = `Precipitation: ${frmt(event.target.__data__[`${season}`])} inches`;
      } else if (dataFile === 'temp') {
        value       = `Temperature: ${frmt(event.target.__data__[`${season}`])}°F`;
      }
      let elevation    = `Elevation: ${Math.round(data.ELEVATION)} meters`;
      let combinedText = `${name},\n${value},\n${elevation}`;

      let yOffset = 70;

      let box = chart.append('rect')
            .attr("rx", 5)
            .attr("ry", 5);

      let tt = chart.append('text')
        //.text(combinedText)
        .attr("x", xScale(event.target.__data__.ELEVATION))
        .attr("y", yScale(event.target.__data__[`${season}`]) - panelHeight - yOffset)
        .style("text-anchor", "middle")
        .attr('id', 'label-text')

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

      const spanById = document.getElementById('grad-labels');
      spanById.textContent = combinedText;

    })
    .on('mouseout', function(event) {
      this.classList.remove('hover');
      d3.select(event.target).attr("r", 6);

      chart.select('#label-text').remove();
      chart.select('#label-rect').remove();

      const spanById = document.getElementById('grad-labels');
      spanById.textContent = '';
    })
}