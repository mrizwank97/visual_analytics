

// Parse the Data
d3.csv("migrant_population.csv", d => {
  return {
    country_code_src: d.country_code_src.toLowerCase(),
    country_src: d.country_src.toLowerCase(),
    country_code_dest: d.country_code_dest.toLowerCase(),
    country_dest: d.country_dest.toLowerCase(),
    number: +d.number
  }
}).then( function(data) {

  var width = 670
  var height = 500 

  data_total = data.filter(d => d.country_src == "total")

  // append the svg object to the body of the page
  var svg = d3.select("#bubble")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("style", "outline: thin solid black;")  
  
  // Color palette for continents?
  var color = d3.scaleOrdinal()
    .domain(data_total.map(function(d) { return d.country_dest; }))
    .range(d3.schemeCategory10);
  
  var size = d3.scaleLinear()
    .domain([0, d3.max(data_total, d => d.number)])
    .range([20,80])
  
  // create a tooltip
  var Tooltip = d3.select("#bubble")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "#69b3a2")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
  
  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(event, d) {
    Tooltip
      .style("opacity", 1)
  }

  var mousemove = function(event, d) {
    Tooltip
      .html('<u>' + d.country_dest + '</u>' + " has " +d.number + " migrants from selected country")
      .style("left", (d3.mouse(this)[0]+20) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  var mouseleave = function(event, d) {
    Tooltip
      .style("opacity", 0)
  }

  var node = svg.append("g")
  .selectAll("g")
  .data(data_total)
  .enter()
  .append("g")
  .attr("class", "node-group")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .on("mouseover", mouseover) // What to do when hovered
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave)
  .call(d3.drag() // call specific function when circle is dragged
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

  // Append circles to the node group
  node.append("circle")
    .attr("class", "node")
    .attr("r", function (d) { return size(d.number) })
    .style("fill", function (d) { return color(d.country_dest) })
    .style("fill-opacity", 0.8)
    .attr("stroke", "black")
    .style("stroke-width", 1)

  //Append text to the center of circle
  node.append("text")
    .attr("class", "node-label")
    .attr("dy", ".30em")
    .style("text-anchor", "middle")
    .text(function (d) { return d.country_code_dest; });

  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.number)+3) }).iterations(1)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
      .nodes(data_total)
      .on("tick", function(d){
        node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
  
  // What happens when a circle is dragged?
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(.03);
    d.fx = null;
    d.fy = null;
  }

  function updateBubbleChart(data_filtered) {

    color.domain(data_filtered.map(function(d) { return d.country_dest; }))
    size.domain([0, d3.max(data_filtered, d => d.number)])
    svg.selectAll("*").remove();
    
    var node = svg.append("g")
      .selectAll("g")
      .data(data_filtered)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .on("mouseover", mouseover) // What to do when hovered
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .call(d3.drag() // call specific function when circle is dragged
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

     // Append circles to the node group
    node.append("circle")
      .attr("class", "node")
      .attr("r", function (d) { return size(d.number) })
      .style("fill", function (d) { return color(d.country_dest) })
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 1)
    
    //Append text to the center of circle
    node.append("text")
      .attr("class", "node-label")
      .attr("dy", ".30em")
      .style("text-anchor", "middle")
      .text(function (d) { return d.country_code_dest; });

    // Features of the forces applied to the nodes:
    var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.number)+3) }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data_filtered)
        .on("tick", function(d){
          node
              .attr("x", function(d){ return d.x; })
              .attr("y", function(d){ return d.y; })
              .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        });


  }
  
  d3.select("#country-select").on("change", function() {
    const selectedOption = d3.select(this).property("value");
    data_filtered = data.filter(d => d.country_src.toLowerCase() == selectedOption.toLowerCase());
    updateBubbleChart(data_filtered);
  });

});



