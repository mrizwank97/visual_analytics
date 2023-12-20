// script.js

document.addEventListener("DOMContentLoaded", async function () {
    // Load your dataset
    const data = await d3.csv('occupations_migration_preprocessed_v5.csv'); 

    // Extract unique countries and sexes for dropdown and checkboxes
    const occupations = Array.from(new Set(data.map(d => d.isco08)));
    const levels = Array.from(new Set(data.map(d => d.isced11)));
    const sexes = Array.from(new Set(data.map(d => d.sex)));

    // Create dropdown for occupations
    const occupationDropdown = d3.select('#occupationDropdown');
    occupations.forEach(occupation => {
        occupationDropdown.append('option')
            .attr('value', occupation)
            .text(occupation);
    });

    // Create dropdown for occupations
    const levelsDropdown = d3.select('#educationDropdown');
    levels.forEach(level => {
        levelsDropdown.append('option')
            .attr('value', level)
            .text(level);
    });

    // Create checkboxes for sexes
    const sexRadios = d3.selectAll('input[type="radio"][name="sex"]');



    // Placeholder for the boxplot SVG
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', 770)
        .attr('height', 400)
        .append('g')
        .attr('transform', 'translate(50, 50)'); // Adjust margins as needed

    // Add event listeners for user interaction
    sexRadios.on('change', update);
    d3.select('#educationDropdown').on('change', update);
    d3.select('#occupationDropdown').on('change', update);    

    // Function to update the visualization based on user input
    function update() {
        // Use only the checked radio button
        const selectedSex = d3.select('input[name="sex"]:checked').node().value;

        const selectedEducation = d3.select('#educationDropdown').property('value');
        const selectedOccupation = d3.select('#occupationDropdown').property('value');

        // Filter data based on user selections
        const filteredData = data.filter(d =>
            d.sex === selectedSex &&
            (!selectedEducation || d.isced11 === selectedEducation) &&
            (!selectedOccupation || d.isco08 === selectedOccupation)
        );

        console.log('Filtered Data:', filteredData);

        // Group data by country, occupation, education level, and immigrant status
        const nestedData = d3.group(filteredData, d => d.geo, d => d.isco08, d => d.isced11, d => d.mgstatus);
        console.log('Nested Data:', nestedData);

        // Flatten nested data for stacked bar chart
        const groupedData = Array.from(nestedData, ([country, occupationMap]) => ({
            country,
            facets: Array.from(occupationMap, ([occupation, educationMap]) => ({
                occupation,
                facets: Array.from(educationMap, ([education, immigrantMap]) => ({
                    education,
                    immigrantStatus: Array.from(immigrantMap, ([immigrant, values]) => ({
                        immigrant,
                        values: values.map(d => +d.OBS_VALUE)  // Using OBS_VALUE as employment value
                    }))
                }))
            }))
        }));

        // Draw stacked bar chart
        console.log('Grouped Bar Chart Data:', groupedData);
        drawCenteredDivergingBarChart(groupedData);
    }



function drawCenteredDivergingBarChart(data) {
    // Clear previous plot
    svg.selectAll('*').remove();
    d3.select('#legend').selectAll('*').remove();

    // Check if there is data to display
    if (!data || data.length === 0 || !data[0].facets) {
        console.error('No data or missing facets property.');
        return;
    }

    // Flatten data for easier processing
    const flattenedData = [];
    data.forEach(country => {
        if (!country.facets || country.facets.length === 0) {
            console.error('No facets or empty facets array for country:', country);
            return;
        }

        country.facets.forEach(facet => {
            if (!facet.facets || facet.facets.length === 0) {
                console.error('No inner facets or empty inner facets array for facet:', facet);
                return;
            }

            facet.facets.forEach(innerFacet => {
                if (!innerFacet.immigrantStatus || innerFacet.immigrantStatus.length === 0) {
                    console.error('No immigrantStatus or empty immigrantStatus array for inner facet:', innerFacet);
                    return;
                }

                innerFacet.immigrantStatus.forEach(status => {
                    flattenedData.push({
                        country: country.country || 'Unknown',
                        immigrant: status.immigrant,
                        value: d3.sum(status.values.map(d => +d)) || 0
                    });
                });
            });
        });
    });

    // Adjust the scales for centered diverging bars
    //const xScale = d3.scaleLinear()
       // .domain([0, d3.max(flattenedData, d => d.value)])
       // .rangeRound([0, 1000]);  // Adjust width as needed

    /////////////////
    // Calculate the total OBS_VALUE for each immigrant status across all countries
    const totalValuesByImmigrantStatus = d3.rollup(flattenedData, 
        v => d3.sum(v, d => d.value), 
        d => d.immigrant);

    // Calculate percentage for each entry in flattenedData
    flattenedData.forEach(d => {
        d.percentage = (d.value / totalValuesByImmigrantStatus.get(d.immigrant)) * 100;
    });

    // Adjust the scales for centered diverging bars using the percentages
    const maxPercentage = d3.max(flattenedData, d => Math.abs(d.percentage));
    const xScale = d3.scaleLinear()
        .domain([-maxPercentage, maxPercentage])
        .rangeRound([0, 770]);  // Adjust width as needed

        /////////////////////////////////////////

    const yScale = d3.scaleBand()
        .domain(flattenedData.map(d => d.country))
        .rangeRound([400, 0])  // Adjust height as needed
        .padding(0.2);

    //const colorScale = d3.scaleOrdinal()
      //  .domain(["NBO", "FBO"])
        //.range(["#008000", "#FFD700"]);

        // Define a color scale based on the percentage values
    const colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(["#FF6666", "#FFFF99", "#99FF99"]);  // Adjust the colors as needed
    


    // Draw centered diverging bars
    //svg.selectAll('.centered-diverging-bar')
      //  .data(flattenedData)
        //.enter()
        //.append('rect')
        //.attr('x', d => (d.immigrant === 'NBO') ? xScale(-d.value) : xScale(0))
        //.attr('y', d => yScale(d.country))
        //.attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
        //.attr('height', yScale.bandwidth())
        //.attr('fill', d => colorScale(d.immigrant));

        // Add a color gradient for the legend
    svg.append("linearGradient")
    .attr("id", "color-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 200)
    .attr("y2", 0)
    .selectAll("stop")
    .data([
        { offset: "0%", color: colorScale(0) },
        { offset: "50%", color: colorScale(50) },
        { offset: "100%", color: colorScale(100) }
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

    // Add a color legend
    const colorLegend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0, -50)");  // Adjust the position of the legend

    colorLegend.append("rect")
    .attr("width", 200)
    .attr("height", 10)
    .style("fill", "url(#color-gradient)");  // Use the color gradient

    colorLegend.append("text")
    .attr("x", -30)
    .attr("y", 25)
    .attr("fill", "noir")
    .style("text-anchor", "start")
    .text("0%");

    colorLegend.append("text")
    .attr("x", 200)
    .attr("y", 25)
    .attr("fill", "noir")
    .style("text-anchor", "end")
    .text("100%");

    // Draw centered diverging bars with the updated color scale
    svg.selectAll('.centered-diverging-bar')
    .data(flattenedData)
    .enter()
    .append('rect')
    .attr('class', 'centered-diverging-bar')
        .attr('x', d => (d.immigrant === 'Native Born') ? xScale(-d.percentage) : xScale(0))
        .attr('y', d => yScale(d.country))
        .attr('width', d => Math.abs(xScale(d.percentage) - xScale(0)))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.percentage))
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    
        // Draw the x-axis with percentage ticks
    svg.append('g')
    .attr('transform', `translate(0, 0)`) // Adjust for the chart's height
    .call(d3.axisBottom(xScale)
    .tickFormat(d => `${Math.abs(Math.round(d))}%`)); // Use Math.abs() to ensure the tick value is always positive


    // Add custom labels above x-axis ticks
    svg.append("text")
    .attr("x", xScale(0) + 40)
    .attr("y", -50)
    .attr("fill", "noir")
    .attr("text-anchor", "start")
    .text("First Generation Immigrant →");

    svg.append("text")
    .attr("x", xScale(0) - 40)
    .attr("y", -50)
    .attr("fill", "noir")
    .attr("text-anchor", "end")
    .text("← Native Born");


// Draw centered diverging bars
//svg.selectAll('.centered-diverging-bar')
    //  .data(flattenedData)
        //.enter()
        //.append('rect')
        //.attr('x', d => (d.immigrant === 'NBO') ? xScale(0) - xScale(d.value) : xScale(0))
        //.attr('y', d => yScale(d.country))
        //.attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
        //.attr('height', yScale.bandwidth())
        //.attr('fill', d => colorScale(d.immigrant));

    // Add x-axis
    //svg.append('g')
      //  .attr('transform', 'translate(0, 300)')
       // .call(d3.axisBottom(xScale))
        //.selectAll('text')
        //.attr('transform', 'rotate(-45)')
        //.style('text-anchor', 'end');

    // Add y-axis
    svg.append('g')
        .call(d3.axisLeft(yScale));

    // Add Legend
    //const legend = svg.selectAll(".legend")
      //  .data(colorScale.domain())
      //  .enter().append("g")
      //  .attr("class", "legend")
      //  .attr("transform", function (d, i) { return "translate(0," + i * 20+ ")"; });

    //legend.append("rect")
    //    .attr("x", 710)
    //    .attr("y",-70)
    //    .attr("width", 18)
    //    .attr("height", 18)
    //    .style("fill", colorScale);

    //legend.append("text")
    //    .attr("x", 735)
    //    .attr("y", -60)
    //    .attr("dy", ".35em")
    //    .style("text-anchor", "start")
    //    .text(function (d) { return d; });

    // Function to handle mouseover event
    function handleMouseOver(event, d) {
        // Show a tooltip or update the information as needed
        //const percentage = Math.round(Math.abs(d.value) / maxTotalValue * 100);
        const tooltipText = `${d.country}: ${Math.round(d.percentage)}%`;
        
        // Append or update a tooltip element
        d3.select('#chart')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('left', event.pageX + 'px')
            .style('top', event.pageY - 20 + 'px')
            .style('background-color', 'rgba(255, 255, 255, 0.8)')
            .style('border', '1px solid #ddd')
            .style('padding', '5px')
            .text(tooltipText);
    }

    // Function to handle mouseout event
    function handleMouseOut() {
        // Remove the tooltip element when the mouse leaves the bar
        d3.select('.tooltip').remove();
    }
}
        
        
    // Add event listeners for user interaction
    levelsDropdown.on('change', update);
    occupationDropdown.on('change', update);
    sexRadios.on('change', update);


    // Initial update to render the default visualization
    update();
});