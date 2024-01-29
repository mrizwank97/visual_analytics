// Set the time format
const parseTime = d3.timeParse("%Y");

// Parse the Data
d3.csv("clevland.csv", d => {
  return {
    country_code: d.country_code,
    country: d.country,
    avg_salary: +d.avg_salary,
    cost_of_living: +d.cost_of_living,
    gap: Math.abs(+d.avg_salary - +d.cost_of_living)
  }
}).then( function(data) {

  // set the dimensions and margins of the graph
  const margin = {top: 50, right: 40, bottom: 55, left: 80},
  width = 675 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#clevland")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  data = data.sort((a, b) => d3.descending(a.gap, b.gap))
  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.avg_salary)])
    .range([ 0, width]);
  
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis")
    .call(d3.axisBottom(x))

  svg.append('text')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height + 50) + ')') // Center the label
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .style('font-style', 'italic')
    .text('Euros (€)');

  // Y axis
  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.country; }))
    .padding(1);
  
  svg.append("g")
    .attr("class", "y-axis")  
    .call(d3.axisLeft(y))
    .selectAll("text")  
    .style("text-anchor", "end")

  var tooltip = d3.select("#clevland")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
  
  
  // Lines
  svg.selectAll("myline")
    .data(data)
    .join("line")
      .attr("x1", function(d) { return x(d.cost_of_living); })
      .attr("x2", function(d) { return x(d.avg_salary); })
      .attr("y1", function(d) { return y(d.country); })
      .attr("y2", function(d) { return y(d.country); })
      .attr("stroke", "grey")
      .attr("stroke-width", "2px")
      .attr("class", "l12")
      .on("mouseover", function(event, d) {
        tooltip
          .style("opacity", 1)
          .html("<b>Country:</b> " + d.country + "<br/><b>Gap:</b> " + d.gap + " <b>&#8364;</b>")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0);
      });

  // Circles of variable 1
  svg.selectAll("mycircle")
    .data(data)
    .join("circle")
      .attr("cx", function(d) { return x(d.cost_of_living); })
      .attr("cy", function(d) { return y(d.country); })
      .attr("r", "6")
      .style("fill", "#69b3a2")
      .attr("class", "c1")
      .on("mouseover", function(event, d) {
        tooltip
          .style("opacity", 1)
          .html("<b>Country:</b> " + d.country + "<br/> <b>Cost of Living:</b> " + d.cost_of_living + " <b>&#8364;</b>")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0);
      });
  
  // Circles of variable 2
  svg.selectAll("mycircle")
    .data(data)
    .join("circle")
      .attr("cx", function(d) { return x(d.avg_salary); })
      .attr("cy", function(d) { return y(d.country); })
      .attr("r", "6")
      .style("fill", "#4C4082")
      .attr("class", "c2")
      .on("mouseover", function(event, d) {
        tooltip
          .style("opacity", 1)
          .html("<b>Country:</b> " + d.country + "<br/><b>Average Salary:</b> " + d.avg_salary + " <b>&#8364;</b>")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0);
      });

  // Adding legend
  const legend = svg.append("g").attr("transform", `translate(${width - 100}, ${20})`);

  // Legend for Cost of Living
  legend.append("circle")
  .attr("cx", 0)
  .attr("cy", 140)
  .attr("r", 6)
  .style("fill", "#69b3a2");

  legend.append("text")
  .attr("x", 10)
  .attr("y", 142)
  .text("Cost of Living")
  .style("font-size", "15px")
  .attr("alignment-baseline","middle");

  // Legend for Average Salary
  legend.append("circle")
  .attr("cx", 0)
  .attr("cy", 170)
  .attr("r", 6)
  .style("fill", "#4C4082");

  legend.append("text")
  .attr("x", 10)
  .attr("y", 172)
  .text("Average Salary")
  .style("font-size", "15px")
  .attr("alignment-baseline","middle");

  // Function to update the chart based on the sorted data
  function updateChart(sortedData) {
    y.domain(sortedData.map(d => d.country));

    svg.selectAll(".y-axis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));
    

    svg.selectAll(".l12")
      .data(sortedData)
      .transition()
      .duration(1000)
      .attr("x1", function(d) { return x(d.cost_of_living); })
      .attr("x2", function(d) { return x(d.avg_salary); })
      .attr("y1", function(d) { return y(d.country); })
      .attr("y2", function(d) { return y(d.country); })

    svg.selectAll(".c1")
      .data(sortedData)
      .transition()
      .duration(1000)
      .attr("cx", function(d) { return x(d.cost_of_living); })
      .attr("cy", function(d) { return y(d.country); })

    svg.selectAll(".c2")
      .data(sortedData)
      .transition()
      .duration(1000)
      .attr("cx", function(d) { return x(d.avg_salary); })
      .attr("cy", function(d) { return y(d.country); })
  }

  d3.select("#sort-select").on("change", function() {
    const selectedOption = d3.select(this).property("value"); 
    if (selectedOption === 'by_country') {
      sortedData =  data.sort((a, b) => d3.ascending(a.country, b.country));
    }
    else if (selectedOption === 'cost_of_living_A') {
      sortedData =  data.sort((a, b) => d3.ascending(a.cost_of_living, b.cost_of_living));
    } else if (selectedOption === 'avg_salary_A') {
      sortedData =  data.sort((a, b) => d3.ascending(a.avg_salary, b.avg_salary));
    } else if (selectedOption === 'cost_of_living_D') {
      sortedData =  data.sort((a, b) => d3.descending(a.cost_of_living, b.cost_of_living));
    } else if (selectedOption === 'avg_salary_D') {
      sortedData =  data.sort((a, b) => d3.descending(a.avg_salary, b.avg_salary));
    } else if (selectedOption === 'widest_gap') {
      sortedData = data.sort((a, b) => d3.descending(a.gap, b.gap))
    } else if (selectedOption === 'narrowest_gap') {
      sortedData = data.sort((a, b) => d3.ascending(a.gap, b.gap))
    }
    updateChart(sortedData);
  });

});

d3.csv("./parallel.csv").then(function(data) {
  
  createParallelCoordinates(data)

});

function getSelectedCheckboxes() {
  var checkboxes = document.getElementsByName("country");
  var selectedCheckboxes = [];

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedCheckboxes.push(checkboxes[i].value);
    }
  }
  if (selectedCheckboxes.length == 0){
    alert("Please select at least one country.")
  }
  else{
    var map = document.getElementById("map");
    var map = eurostatmap
      .map("chbi")
      .height(600)
      .width(670)
      .nutsLvl(2)
      .nutsYear(2016)
      .countriesToShow(selectedCheckboxes)
      .stat("v1", { eurostatDatasetCode: "demo_r_d3dens", unitText: "inh./km²" })
      .stat("v2", { eurostatDatasetCode: "lfst_r_lfu3rt", filters: { age: "Y_GE15", sex: "T", unit: "PC", time: 2022 }, unitText: "%" })
      .clnb(4)
      .scale("60M")
      .legend({ boxFill: "none", squareSize: 80, label1: "Unemployment", label2: "Population", x: 10, y: 140 })
      .drawGraticule(false)
      .seaFillStyle("#d3dee8")
      .drawCoastalMargin(false)
      .zoomExtent([1, 3])
      .build();
  }
  
}

function updateParallelForSelected(){
  var checkboxes = document.getElementsByName("country");
  var selectedCheckboxes = [];
  var dataNotAvailable = [];

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedCheckboxes.push(document.querySelector(`label[for=${checkboxes[i].value}]`).textContent.toLowerCase());
    }
  }
  d3.csv("./parallel.csv").then(function(data) {
   // filter data for selected countries
    filteredData = data.filter(d => selectedCheckboxes.includes(d.country.toLowerCase()))
    // if length of filtered data is 0, show alert
    if (filteredData.length == 0){
      alert("Either you have not selected any country or the selected countries do not have data.")
    }
    else{
      createParallelCoordinates(filteredData)
    }
    
    // perform set subtraction to get countries for which data is not available
    dataNotAvailable = selectedCheckboxes.filter(x => !filteredData.map(d => d.country.toLowerCase()).includes(x))
    // get paragraph by id and add text
    var para = document.getElementById("parallel-text");
    if (dataNotAvailable.length == 0){
      para.innerHTML = "Data for all selected countries is available."
    }
    else{
      para.innerHTML = "Data for <b><u>" + dataNotAvailable.join(", ") + "</u></b> is not available."
    }
  });
}

const createParallelCoordinates = (data) => {

  var margin = {top: 50, right: 50, bottom: 50, left: 0},
  width = 750 - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom;
  
  //create data variable will contain d3 csv data later
  var data1 = [];
  var data2 = [];

  d3.select("#parallel").selectAll("*").remove();



  var svg = d3.select("#parallel")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Move the color scale here to share with both charts
  const countries = Array.from(new Set(data.map(d => d.country))).sort();
  const colors = d3.scaleOrdinal()
    .domain(countries)
    .range(d3.quantize(d3.interpolateRainbow, countries.length));
  
  var dimensions = [];
  for (var key in data[0]) dimensions.push(key);
  dimensions.shift();

  var y = {}
  for (i in dimensions) {
    dim = dimensions[i]
    y[dim] = d3.scaleLinear()
      .domain([0,100])
      .range([height, 0])
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  // Draw the lines

  // // filter data for france and italy
  // data1 = data.filter(d => d.country == "France" || d.country == "Italy" || d.country == "Germany" || d.country == "Spain")
  // // remove france and italy from data
  // data2 = data.filter(d => d.country != "France" && d.country != "Italy" && d.country != "Germany" && d.country != "Spain")
  data.sort(function(a, b) {return b["less than 3 months"] - a["less than 3 months"];});

  data1 = data.slice(0, 5);
  data2 = data.slice(5, data.length);

  svg
    .selectAll("myPath")
    .data(data1, d => d.country)
    .enter().append("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", d => colors(d.country))
    .style("opacity", 1)
    .style("stroke-width", 2)

  const labels = svg
    .selectAll("text.label")
    .data(data1, d => d.country)
    .join("text")
      .attr("class", d => d.country)
      .attr("x", width-95) // Adjust the position as needed
      .attr("y", function (d) {return y[dimensions[dimensions.length - 1]](d[dimensions[dimensions.length - 1]]);})
      .style("fill", d => colors(d.country))
      .attr("dy", "0.35em")
      .style("font-family", "sans-serif")
      .style("font-size", 12)
    .text(d => d.country);

    svg
    .selectAll("myPath")
    .data(data2, d => d.country)
    .enter().append("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", d => colors(d.country))
    .style("opacity", .1)
    .style("stroke-width", 2)
    .on("mouseover", function(event, d) {
      d3.select(`text.${d.country}`)
      .style("visibility", "visible")
      d3.select(this).style("opacity", 1)
    })
    .on("mouseout", function(event, d) {
      d3.select(`text.${d.country}`)
      .style("visibility", "hidden")
      d3.select(this).style("opacity", .1)
    })

  const labels1 = svg
    .selectAll("text.label")
    .data(data2, d => d.country)
    .join("text")
      .attr("class", d => d.country)
      .attr("x", width-95) // Adjust the position as needed
      .attr("y", function (d) {return y[dimensions[dimensions.length - 1]](d[dimensions[dimensions.length - 1]]);})
      .style("fill", d => colors(d.country))
      .attr("dy", "0.35em")
      .style("font-family", "sans-serif")
      .style("font-size", 12)
    .text(d => d.country);
  labels1.style("visibility", "hidden")

    // svg
    // .selectAll("myPath")
    // .data(data1)
    // .enter().append("path")
    // .attr("d",  path)
    // .style("fill", "none")
    // .style("stroke", d => colors(d.country))
    // .style("opacity", 1)

    // const labels = svg.selectAll("text.label")
    // .data(data)
    // .join("text")
    //   .attr("x", width - margins.right + 5)
    //   .attr("y", d => y[4](d[dimensions[4]]))
    //   .attr("dy", "0.35em")
    //   .style("font-family", "sans-serif")
    //   .style("font-size", 12)
    //   .style("fill", d => colors(d.country))
    // .text(d => d.country);

  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
      .style("font-weight", "bold")

    var textElement = svg.append('text')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height + 30) + ')') // Center the label
        .style('text-anchor', 'middle')
        .style('font-size', 14);
      //.style('font-weight', 'bold')
      //.style('font-style', 'italic')
    // Append the first part of the text (non-bold)
    textElement.append("tspan").text("Unit of measurement: ").style("font-weight", "bold");;

    // Append the second part of the text (bold)
    textElement.append("tspan").text("Percentage (%) of Foreign People");


    
    // add country name as label
      // Add country names as text labels at the end of each line
  // const labels = svg
  //   .selectAll("text.label")
  //   .data(data)
  //   .enter()
  //   .append("text")
  //   .attr("x", width-95) // Adjust the position as needed
  //   .attr("y", function (d) {
  //     return y[dimensions[dimensions.length - 1]](d[dimensions[dimensions.length - 1]]);
  //   })
  //   .text(function (d) {
  //     return d.country; // Assuming the column name is "Country"
  //   })
  //   .style("fill", d => colors(d.country))
  //   .attr("dy", "0.35em")
  //   .style("font-family", "sans-serif")
  //   .style("font-size", 12);
  //labels.style("visibility", "hidden")
}
