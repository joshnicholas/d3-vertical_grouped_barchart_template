//Guardian-specific responsive iframe function

iframeMessenger.enableAutoResize();

var data_path = "data/something.csv";

var colour_choices = ["rgb(179, 179, 180)",
"rgb(0, 178, 255)",
"rgb(255, 127, 15)",
"rgb(0, 178, 255)",
"rgb(255, 127, 15)",
"rgb(245, 189, 44)",
"rgb(179, 179, 180)",
"rgb(128, 128, 128)"];

function draw_bars(data) {

		var data = data[0];

		console.log("data", data);
		
		// grab the name of the first column to use later

		index_column = data.columns[0];

		// create an array to use as y axis ticks

		var groupKey = data.map(d => d[index_column])

		// create an array to use as groupings (and filter out the index column)

		var subgroups = data.columns
		var keys = subgroups.filter(col => col != index_column)

		// setup canvas dimensions

		var isMobile;
		var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

		if (windowWidth < 610) {
				isMobile = true;
		}	

		if (windowWidth >= 610){
				isMobile = false;
		}

		var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
		var height = width*0.6;					
		var margin = {top: 20, right: 0, bottom: 0, left:150};

		width = width - margin.left - margin.right,
		height = height - margin.top - margin.bottom;
   

		d3.select("#graphicContainer svg").remove();

		var svg = d3.select("#graphicContainer").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("id", "svg")
			.attr("overflow", "hidden");					

		// create scales - one for x and y and then an extra y for grouping

		y0 = d3.scaleBand()
			.domain(data.map(d => d[[index_column]]))
			.rangeRound([margin.top, height - margin.bottom])
			.paddingInner(0.1)

		// this is the one for grouping
		
		y1 = d3.scaleBand()
			.domain(keys)
			.rangeRound([y0.bandwidth(), 0])
			.padding(0.05)
		
		x = d3.scaleLinear()
			.domain([0, 100])
			.rangeRound([margin.left, width - margin.right])

		// colours for the bars 
		
		color = d3.scaleOrdinal()
			.range(colour_choices)

		// create axes

		xAxis = g => g
			.attr("transform", `translate(0,${height - margin.bottom})`)
			.call(d3.axisBottom(x).tickSizeOuter(0))
			.call(g => g.select(".domain").remove())
			.call(d3.axisBottom(x).ticks(3, "s"))
			.call(g => g.select(".tick:last-of-type text").clone()
				.attr("x", 15)
				.attr("text-anchor", "start")
				.attr("font-weight", "bold")
				.text(data.y))
			
		yAxis = g => g
			.attr("transform", `translate(${margin.left},0)`)
			.call(d3.axisLeft(y0).ticks(null, "s"))
			.call(g => g.select(".domain"))

			
		// create the key for the groupings

		legend = svg => {
		const g = svg
			.attr("transform", `translate(${width},0)`)
			.attr("text-anchor", "end")
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.selectAll("g")
			.data(color.domain()
			.slice()
			.reverse())
			.enter()
			.append("g")
			.attr("transform", (d, i) => `translate(30,${(i*20)})`);
		
		g.append("rect")
			.attr("x", -19)
			.attr("width", 19)
			.attr("height", 19)
			.attr("fill", color);
		
		g.append("text")
			.attr("x", -24)
			.attr("y", 9.5)
			.attr("dy", "0.35em")
			.text(d => d);}

		// create a grouping for each y value then append bars to it 
	
		svg.append("g")
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
			.attr("transform", d => `translate(0,${y0(d[[index_column]])})`)
			.selectAll("rect")
			.data(d => keys.map(key => ({key, value: d[key]})))
			.enter()
			.append("rect")
			.attr("x", d => x(0))
			.attr("y", d => y1(d.key))
			.attr("height", y1.bandwidth())
			.attr("width", d => x(d.value) - x(0))
			.attr("fill", d => color(d.key));
	  
		// call axes and legend 

		svg.append("g")
			.call(xAxis);

		svg.append("g")
			.call(yAxis);
			
		svg.append("g")
			.call(legend);

} 

var q = d3.queue()
        .defer(d3.csv, data_path)
        .awaitAll(function(error, results) {
			draw_bars(results)
			var to=null
			var lastWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
			window.addEventListener('resize', function() {
				var thisWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
				if (lastWidth != thisWidth) {
					window.clearTimeout(to);
					to = window.setTimeout(function() {
						draw_bars(results)
						}, 500)
				}
			})
        });

