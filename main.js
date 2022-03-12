// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 50, left: 70},
    width = 500 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Read the data and compute summary statistics for each specie
d3.csv("KSEA-m.csv").then(function(data) {
  // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) {return d.month;})
    .rollup(function(d) {
      q1 = d3.quantile(d.map(function(g) { return g.actual_mean_temp;}).sort(d3.ascending),.25)
      median = d3.quantile(d.map(function(g) { return g.actual_mean_temp;}).sort(d3.ascending),.5)
      q3 = d3.quantile(d.map(function(g) { return g.actual_mean_temp;}).sort(d3.ascending),.75)
      interQuantileRange = q3 - q1
      min = q1 - 1.5 * interQuantileRange
      max = q3 + 1.5 * interQuantileRange
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(data)

  // Show the Y scale
  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(["December","November", "October", "September", "August", "July", "June", "May", "April", "March", "February", "January"])
    .padding(.3);
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Show the X scale
  var x = d3.scaleLinear()
    .domain([10,80])
    .range([0, width])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5))
    .select(".domain").remove()


  // Color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([10,80])

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.top + 30)
      .text("temp");


  // Show the main vertical line
  svg
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.value.min))})
      .attr("x2", function(d){return(x(d.value.max))})
      .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
      .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
      .attr("stroke", "black")
      .style("width", 40)

  // rectangle for the main box
  svg
    .selectAll("boxes")
    .data(sumstat)
    .enter()
    .append("rect")
        .attr("x", function(d){return(x(d.value.q1))}) // console.log(x(d.value.q1)) ;
        .attr("width", function(d){ return(x(d.value.q3)-x(d.value.q1))}) //console.log(x(d.value.q3)-x(d.value.q1))
        .attr("y", function(d) { return y(d.key); })
        .attr("height", y.bandwidth() )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")
        .style("opacity", 0.3)

  // Show the median
  svg
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("y1", function(d){return(y(d.key))})
      .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
      .attr("x1", function(d){return(x(d.value.median))})
      .attr("x2", function(d){return(x(d.value.median))})
      .attr("stroke", "black")
      .style("width", 80)


  // create a tooltip
  var tooltip = d3.select("#my_dataviz")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("font-size", "16px")
  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 1)
    tooltip
        .html("<span style='color:grey'>temperature is : </span>" + d.actual_mean_temp) // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var mousemove = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Add individual points with jitter
  var jitterWidth = 50
  svg
    .selectAll("indPoints")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return(x(d.actual_mean_temp))})
      .attr("cy", function(d){ return( y(d.month) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth )})
      .attr("r", 4)
      .style("fill", function(d){ return(myColor(+d.actual_mean_temp)) })
      .attr("stroke", "black")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)


})
