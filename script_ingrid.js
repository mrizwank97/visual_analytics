document.addEventListener("DOMContentLoaded", async function () {

    var width = 1200,
        height = 600,
        margin = 50;

    var x = d3.scaleLinear()
        .range([0, width - 3 * margin]);

    var y = d3.scaleLinear()
        .range([0, height - 2 * margin]);

    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var n = d3.format(",d"),
        p = d3.format(".0%");

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", "translate(" + 2 * margin + "," + margin + ")");

// Load CSV data
    const data = await d3.csv('occupations_migration_preprocessed_v5.csv'); 

    // Add a 'totalValue' property to each record
    data.forEach(function(d) {
        d.totalValue = parseFloat(d.OBS_VALUE);
    });

    data.sort(function(a, b) {
        return b.totalValue - a.totalValue;
    });

    // Nest values by segment. We assume each segment+market is unique.
    var segments = d3.group(data, d => d.geo);

    // Compute the total sum, the per-segment sum, and the per-market offset.
    var sum = 0;

    segments.forEach(function (value, key) {
        value.forEach(function (d) {
            d.parent = { key: key };
            sum += parseFloat(d.OBS_VALUE);
        });
    });

    // Now sum is accessible throughout the script
    console.log("sum:", sum);


    // Add x-axis ticks.
    var xtick = svg.selectAll(".x")
        .data(x.ticks(10))
        .enter().append("g")
        .attr("class", "x")
        .attr("transform", function(d) { return "translate(" + x(d) + "," + y(1) + ")"; });

    xtick.append("line")
        .attr("y2", 6)
        .style("stroke", "#000");

    xtick.append("text")
        .attr("y", 8)
        .attr("text-anchor", "middle")
        .attr("dy", ".71em")
        .text(p);

      // Add y-axis ticks.
    var ytick = svg.selectAll(".y")
    .data(y.ticks(10))
    .enter().append("g")
    .attr("class", "y")
    .attr("transform", function(d) { return "translate(0," + y(1 - d) + ")"; });

    ytick.append("line")
    .attr("x1", -6)
    .style("stroke", "#000");

    ytick.append("text")
    .attr("x", -8)
    .attr("text-anchor", "end")
    .attr("dy", ".35em")
    .text(p);

    // Populate isco08 dropdown
    var isco08Dropdown = d3.select("#isco08Dropdown");
    var isco08Options = Array.from(new Set(data.map(function(d) { return d.isco08; })));
    isco08Dropdown.selectAll("option")
        .data(isco08Options)
        .enter().append("option")
        .text(function(d) { return d; });

    // Populate isced11 dropdown
    var isced11Dropdown = d3.select("#isced11Dropdown");
    var isced11Options = Array.from(new Set(data.map(function(d) { return d.isced11; })));
    isced11Dropdown.selectAll("option")
        .data(isced11Options)
        .enter().append("option")
        .text(function(d) { return d; });

        // Populate sex dropdown
        var sexDropdown = d3.select("#sexSelector");
        sexDropdown.selectAll("option").remove(); // Remove existing options

        var sexOptions = Array.from(new Set(data.map(function(d) { return d.sex; }))).filter(function(d) { return d !== "All"; });
        sexDropdown.selectAll("option")
        .data(sexOptions)
        .enter().append("option")
        .text(function(d) { return d; });
    

    // Handle selection change event
    d3.selectAll("#isco08Dropdown, #isced11Dropdown, #sexSelector").on("change", updateChart);

    // Initial chart rendering
    updateChart();


    // Declare filteredSegmentsArray outside the updateChart function
    var filteredSegmentsArray;

    var xtickTop = svg.selectAll(".x-top");

        // Add a group for each segment.
    var segmentsGroup = svg.selectAll(".segment")
    .data(filteredSegmentsArray) // Use the new data structure
    .enter().append("g")
    .attr("class", "segment")
    .attr("xlink:title", function (d) { return d.key; })
    .attr("transform", function (d) { return "translate(" + x(d.offset / filteredSum) + ")"; });

     // Add a rect for each market in the top 10 segments.
    var markets = segmentsGroup.selectAll(".market")
        .data(function (d) { return d.values; })
        .enter().append("a")
        .attr("class", "market")
        .attr("xlink:title", function (d) {
            return d.mgstatus + " " + d.parent.key + ": " + d3.format(".1f")(parseFloat(d.OBS_VALUE));
        })
        .append("rect")
        .attr("y", function (d) { return y(d.offset / d.parent.sum); })
        .attr("height", function (d) { return y(parseFloat(d.OBS_VALUE) / d.parent.sum); })
        .attr("width", function (d) { return x(d.parent.sum / filteredSum); })
        .style("fill", function (d) { return z(d.mgstatus); });

    // Add text label for each market with OBS_VALUE in the top 10 segments
    markets.append("text")
        .attr("x", function (d) { return x(d.parent.sum / filteredSum) / 2; })
        .attr("y", function (d) {
            return y(d.offset / d.parent.sum) + y(parseFloat(d.OBS_VALUE) / d.parent.sum / 2) - 3;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .text(function (d) { return d3.format(".1f")(parseFloat(d.OBS_VALUE)); });

    function createLegend() {
        var legend = d3.select("#legend")
            .append("svg")
            .attr("width", 300) // Adjust the width as needed
            .attr("height", 50); // Adjust the height as needed

        var legendData = [
            { label: "First Generation Immigrant", color: "#73ae80" },
            { label: "Native Born", color: "#6c83b5" }
        ];

        var legendItems = legend.selectAll(".legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legendItems.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) {
                return d.color;
            });

        legendItems.append("text")
            .attr("x", 25)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d) {
                return d.label;
            });
    }

    // Create color legend
    createLegend();


    function updateChart() {
        // Get selected values
        var selectedIsco08 = isco08Dropdown.node().value;
        var selectedIsced11 = isced11Dropdown.node().value;
        var selectedSex = sexDropdown.node().value;

        // Filter data based on selected values
        var filteredData = data.filter(function(d) {
        return ((d.isco08 === selectedIsco08) &&
                (d.isced11 === selectedIsced11) &&
                (d.sex === selectedSex));
        });
        

        // Update the chart with filtered data
        // Remove existing chart elements
        svg.selectAll(".segment").remove();
        svg.selectAll(".x-top").remove(); // Remove existing x-axis ticks and labels

        // Recompute the segments for filtered data
        var filteredSegments = d3.group(filteredData, d => d.geo);

        // Declare variables for filteredSum, segment offset, and segment sum
        var filteredSum = 0;

        // Recompute the segments for filtered data
        var filteredSegments = d3.group(filteredData, d => d.geo);
        console.log("filteredSegments:", filteredSegments);

        // Convert InternMap to array of objects
        filteredSegmentsArray = Array.from(filteredSegments, ([key, values]) => ({ key, values }));
        console.log("filteredSegmentsArray:", filteredSegmentsArray);

        // Recompute the total sum, the per-segment sum, and the per-market offset for filtered data
        filteredSum = filteredSegmentsArray.reduce(function (v, p) {
            return (p.offset = v) + (p.sum = p.values.reduceRight(function (v, d) {
                d.parent = p;
                return (d.offset = v) + parseFloat(d.OBS_VALUE);
            }, 0));
        }, 0);

                // Sort the filtered segments based on the sum in descending order
        filteredSegmentsArray.sort(function(a, b) {
            return b.sum - a.sum;
        });



        // Add a group for each segment in the filtered data
        var filteredSegmentsGroup = svg.selectAll(".segment")
            .data(filteredSegmentsArray)
            .enter().append("g")
            .attr("class", "segment")
            .attr("xlink:title", function (d) { return d.key; })
            .attr("transform", function (d) { return "translate(" + x(d.offset / filteredSum) + ")"; });

                // Add a rect for each market in the filtered data
                // Add a rect for each market in the filtered data
        var filteredMarkets = filteredSegmentsGroup.selectAll(".market")
        .data(function (d) { return d.values; })
        .enter().append("a")
        .attr("class", "market")
        .attr("xlink:title", function (d) {
            return d.mgstatus + "\n" + d.parent.key + "\n" + d3.format(".1f")(parseFloat(d.OBS_VALUE));
        })
        .append("rect")
        .attr("y", function (d) { return y(d.offset / d.parent.sum); })
        .attr("height", function (d) { return y(parseFloat(d.OBS_VALUE) / d.parent.sum); })
        .attr("width", function (d) { return x(d.parent.sum / filteredSum); })
        .style("fill", function (d) {
            // Set color based on mgstatus (immigrant or native)
            return d.mgstatus === "First Generation Immigrant" ? "#73ae80" : "#6c83b5";
        });

        // Add text label for each market in the filtered data with OBS_VALUE
        filteredMarkets.append("text")
        .attr("x", function (d) { return x(d.parent.sum / filteredSum) / 2; })
        .attr("y", function (d) { return y(d.offset / d.parent.sum) + y(parseFloat(d.OBS_VALUE) / d.parent.sum / 2); })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .text(function (d) { return d3.format(".1f")(parseFloat(d.OBS_VALUE)); });



        // Print countries with values for mgstatus category "first generation immigrants"
        var firstGenImmigrantsData = filteredData.filter(function (d) {
            return d.mgstatus === "First Generation Immigrant";
        });

        // Sort the data in descending order based on OBS_VALUE
        firstGenImmigrantsData.sort(function (a, b) {
            return parseFloat(b.totalValue) - parseFloat(a.totalValue);
        });

        // Print the countries and values
        console.log("Countries with values for 'first generation immigrants':");
        firstGenImmigrantsData.forEach(function (d) {
            console.log(d.geo + ": " + d3.format(".1f")(parseFloat(d.totalValue)));
        });


        // Filter filteredSegmentsArray based on the top 5 countries from firstGenImmigrantsData
        var filteredSegmentsArrayTop5 = filteredSegmentsArray.filter(function (segment) {
            return firstGenImmigrantsData.slice(0, 5).some(function (topCountry) {
                return segment.key === topCountry.geo;
            });
        });

        // Update xtickTop to display only the geo text of the top 5 countries
        var xtickTop = svg.selectAll(".x-top")
            .data(filteredSegmentsArrayTop5)
            .enter().append("g")
            .attr("class", "x-top")
            .attr("transform", function (d) {
                // Calculate translateX here
                var translateX = x((d.offset + d.sum / 2) / filteredSum) + 7;
                return "translate(" + translateX + "," + (height - 7.3 * margin) + ")";
            });

        //xtickTop.append("line")
        //.attr("y2", -6)
        //.style("stroke", "#000");

        xtickTop.append("text")
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("font-weight", "bold") // Set the text to be bold
        .style("fill", "#white") // Set the text color to orange
        .text(function (d) { return d.key; });

        }
    });