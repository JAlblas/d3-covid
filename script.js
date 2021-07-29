// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#data-viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.dsv(';', './Municipality_cases_time_series.csv', function(d) {
    return {    ...d,
            date : d3.timeParse("%Y-%m-%d")(d.SampleDate)
         }
})
.then(function(data)  {

    var allGroup = Object.keys(data[0]);
    allGroup=allGroup.slice(1,101).sort();

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button;
      .property("selected", function(d){ return d === "Copenhagen"; })

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

          // Define the div for the tooltip
    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


    // Add X axis --> it is a date format
    var x = d3.scaleTime()
    .rangeRound([0, width])
    .domain(d3.extent(data, function(d) { return d.date; }))
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));


    // Add Y axis   
    var y = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.Copenhagen * 1.20; }))
      .range([ height, 0 ]);

    var yAxis = svg.append("g")
      .call(d3.axisLeft(y));

    var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.Copenhagen); });

    
    // Initialize line with group a
    var line = svg
      .append('g')
      .append("path")
        .datum(data)
        .attr("stroke", function(d){ return myColor("value") })
        .style("stroke-width", 2)
        .style("fill", "none")
        .attr("d", line);

    // A function that update the chart
    function update(selectedGroup) {

      // Create new data with the selection?
      var dataFilter = data.map(function(d){return {date: d.date, value:d[selectedGroup]} })


      y.domain([0, d3.max(dataFilter, function(d) { return d.value * 1.20 }) ]);
      yAxis.transition().duration(1000).call(d3.axisLeft(y));


      // Give these new data to update line
      line
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(+d.date) })
            .y(function(d) { return y(+d.value) })
          )
          .attr("stroke", function(d){ return myColor(selectedGroup) })
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })

});





