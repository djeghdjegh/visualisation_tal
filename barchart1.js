function main() {
	var svg = d3.select("svg");
	var width = 400;
	var height = 170;

	svg.append("text")
	   .attr("transform", "translate(100,0)")
	   .attr("x", 10)
	   .attr("y", 40)
	   .attr("font-size", "24px")
	   .attr("font-weight", "bold") 
	   .text("Stapibility histogramme")

	var xScale = d3.scaleBand().range([0, width]).padding(0.1),
		yScale = d3.scaleLinear().range([height, 0]);

	var g = svg.append("g")
		.attr("transform", "translate(20," + 100 + ")"); // Adjusted the x-translation to 0

	d3.csv("Quality1.csv").then(function (data) {
		xScale.domain(data.map(function (d) { return d.Country; }));
		yScale.domain([0, d3.max(data, function (d) { return d.Stability; })]);

		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale))
			.selectAll("text")
			.attr("transform", "rotate(-45)")
			.style("text-anchor", "end");

		g.append("g")
			.call(d3.axisLeft(yScale).tickFormat(function (d) { return d; }).ticks(10))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 10)
			.attr('dy', '-5em')
			.attr('text-anchor', 'end')
			.attr('stroke', 'blue');

		g.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("fill", "steelblue")
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function (d) { return xScale(d.Country); })
			.attr("y", function (d) { return yScale(d.Stability); })
			.attr("width", xScale.bandwidth())
			.transition()
			.ease(d3.easeLinear)
			.duration(500)
			.delay(function (d, i) { return i * 50 })
			.attr("height", function (d) { return height - yScale(d.Stability); });
	})

	function onMouseOver(d, i) {
		var xPos = parseFloat(d3.select(this).attr('x')) + xScale.bandwidth() / 2;
		var yPos = parseFloat(d3.select(this).attr('y')) / 2 + height / 2;

		d3.select('#tooltip')
			.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.select('#value').text(i.value);

		d3.select('#tooltip').classed('hidden', false);
		d3.select(this).attr('class', 'highlight')
			.attr('fill', 'lightblue');

		d3.select(this).attr('class', 'highlight')
			.transition()
			.duration(500)
			.attr('width', xScale.bandwidth() + 5)
			.attr('y', function (d) { return yScale(d.Stability) - 10; })
			.attr('height', function (d) { return height - yScale(d.Stability) + 10; });
	}

	function onMouseOut(d, i) {
		d3.select(this).attr('class', 'bar');
		d3.select(this)
			.transition()
			.duration(500)
			.attr('width', xScale.bandwidth())
			.attr('y', function (d) { return yScale(d.Stability); })
			.attr('height', function (d) { return height - yScale(d.Stability); })
			.attr("fill", "steelblue");

		d3.select('#tooltip').classed('hidden', true);
	}

	d3.csv('data.csv', function (data) {
		// Variables
		var body = d3.select('body')
		  var margin = { top: 100, right: 100, bottom: 100, left: 100 }
		  var h = 400 - margin.top - margin.bottom
		  var w = 400 - margin.left - margin.right
		  var formatPercent = d3.format('.2%')
		  // Scales
		var colorScale = d3.scale.category20()
		var xScale = d3.scale.linear()
		  .domain([
			  d3.min([0,d3.min(data,function (d) { return d['Stability']})]),
			  d3.max([0,d3.max(data,function (d) { return d['Stability']})])
			  ])
		  .range([0,w])
		var yScale = d3.scale.linear()
		  .domain([
			  d3.min([0,d3.min(data,function (d) { return d['Rank'] })]),
			  d3.max([0,d3.max(data,function (d) { return d['Rank'] })])
			  ])
		  .range([h,0])
		  // SVG
		  var svg = body.append('svg')
			  .attr('height',h + margin.top + margin.bottom)
			  .attr('width',w + margin.left + margin.right)
			.append('g')
			  .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
		  // X-axis
		  var xAxis = d3.svg.axis()
			.scale(xScale)
			.tickFormat(formatPercent)
			.ticks(5)
			.orient('bottom')
		// Y-axis
		  var yAxis = d3.svg.axis()
			.scale(yScale)
			.tickFormat(formatPercent)
			.ticks(5)
			.orient('left')
		// Circles
		var circles = svg.selectAll('circle')
			.data(data)
			.enter()
		  .append('circle')
			.attr('cx',function (d) { return xScale(d['Stability']) })
			.attr('cy', function (d) { return yScale(d['Rank']); })
	  
			.attr('r','10')
			.attr('stroke','black')
			.attr('stroke-width',1)
			.attr('fill',function (d,i) { return colorScale(i) })
			.on('mouseover', function () {
			  d3.select(this)
				.transition()
				.duration(500)
				.attr('r',20)
				.attr('stroke-width',3)
			})
			.on('mouseout', function () {
			  d3.select(this)
				.transition()
				.duration(500)
				.attr('r',10)
				.attr('stroke-width',1)
			})
		  .append('title') // Tooltip
		  .text(function (d) {
			return d.variable +
			  '\n Rank: ' + formatPercent(d['Rank']) +
			  '\n Stability: ' + formatPercent(d['Stability']);
		  })
		  
		// X-axis
		svg.append('g')
			.attr('class','axis')
			.attr('transform', 'translate(0,' + h + ')')
			.call(xAxis)
		  .append('text') // X-axis Label
			.attr('class','label')
			.attr('y',-10)
			.attr('x',w)
			.attr('dy','.71em')
			.style('text-anchor','end')
			.text('Rank')
		// Y-axis
		svg.append('g')
			.attr('class', 'axis')
			.call(yAxis)
		  .append('text') // y-axis Label
			.attr('class','label')
			.attr('transform','rotate(-90)')
			.attr('x',0)
			.attr('y',5)
			.attr('dy','.71em')
			.style('text-anchor','end')
			.text('Stability')
	  })
	  document.addEventListener("DOMContentLoaded", function() {
		main();
	  });
	  
}
