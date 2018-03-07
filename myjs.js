var margin = {top: 40, right: 40, bottom: 40, left: 40}
var w = 750 - margin.left - margin.right;
var h = 400  - margin.top - margin.bottom;


var barPadding = 4;
var yearindex 
var selectedyear
var yeararray = []

var months = ['Jan', 'Feb', 'Mar', 'April', 'May',
				'June', 'July', 'August', 'Sep', 'Oct',
				'Nov', 'Dec']


var svg = d3.select("body")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
			

d3.csv("meteo.csv", function(dataset2) 
{
	dataset = dataset2.map(function(d) 
	{ 
		return {"year": +d.year, "month": +d.month, "day": +d.day,"temperature": +d.temperature}
	}); 

	// transform dataset

	var transformedarray = d3.nest()
		.key(function (d){return d.year;})
		.key(function (k){return k.month;})
		.rollup(function(v) { 
			meanvalue = +d3.mean(v, function(d) { 
				return (+d3.format(".0f")(+parseFloat(d.temperature))/10)			//round up and divide by 10
			})
			return d3.format(".1f")(meanvalue); 
				})   //gia kathe array me tis times tou calc to average
		.entries(dataset)

	parentdataset = transformedarray
	dataset = transformedarray[0].values								// each time its gonna have another year
	selectedyear = parentdataset[0].key
	for (k=0; k<parentdataset.length; k++)
	{
		yeararray[k]=+parentdataset[k].key
	}
	yearindex = 0
	console.log("yeararray:", yeararray)
	console.log("selectedyear:", selectedyear)
	console.log("parentdataset: ",parentdataset)


	// end processing

	max = d3.max(dataset, function(d) 
    {
        return +d.value
    })
	min = d3.min(dataset, function(d) 
	{
		return +d.value
    })


	console.log("max:", max)
	console.log("min:", min)
	console.log("dataset.length:", dataset.length)

	
	var x = d3.scaleBand()
        .domain(months)
        .range([0, w]);

    var y = d3.scaleLinear()
		.domain([0, max])
        .range([h, margin.top]);
		//.range([h, 0]);
	
				  
	//=====================================
	// rectangles

	svg.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function(d, i) 
		{
			return margin.left + barPadding + i * (w - barPadding) / dataset.length;
		})
		.attr("y", function(d) 
		{
			return y(d.value)
		})
		.attr("width", w / dataset.length - barPadding)
		.attr("height", function(d) 
		{
			return h-y(d.value)
		}) 
		.attr("fill", "teal");
	   
	// Text


	svg.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "white")
		.attr("text-anchor", "middle")
		.text(function(d) {
			return d.value;
	})
		.attr("x", function(d, i) {
			return (margin.left + barPadding + i * (w - barPadding) / dataset.length) + (w / dataset.length - barPadding)/2;	//each bar's x + half a bar!
	})
		.attr("y", function(d) {
			return y(d.value)+14;
	});    

	// axis
	
	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y);
		
	var xAxisGroup = svg.append("g")
		.attr('class', 'axis')
		.attr('transform', 'translate('+margin.left+','+h+')')   //needs fix
		.call(xAxis)
		.append("text")             
		.attr("transform",
				"translate(" + (w/2) + " ," + (h + margin.top + 20) + ")")
		.style("text-anchor", "middle")
		.text("Months");
		  
	var yAxisGroup = svg.append("g")
		.attr('class', 'axis')
		.attr('transform', 'translate('+margin.left+',0)')
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		//.attr("x",0 - (h / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Temperature");  

	d3.selectAll("#svgtext").append("p")
		.attr('class', "lolen")
		.text(selectedyear);

	// buttons' actions

	d3.select("#next").on("click", function()									// when you press next
	{
		console.log("yeararray:", yeararray)
		console.log("attempting to get:", parseInt(selectedyear)+1)
		if (yeararray.includes(parseInt(selectedyear)+1))						// if the next year exists in the data
		{
			console.log("Thank god next exists")

			selectedyear = +(parseInt(selectedyear)+1)
			yearindex =+yearindex+1
			dataset = parentdataset[yearindex].values
			console.log("new selectedyear is ", selectedyear)
			console.log("new yearindex is ", yearindex)
			console.log("NEW dataset: ", dataset)


			max = d3.max(dataset, function(d) 
		    {
		        return +d.value
		    })
			min = d3.min(dataset, function(d) 
			{
				return +d.value
		    })


			console.log("max:", max)
			console.log("min:", min)
			console.log("dataset.length:", dataset.length)

		    var bar = svg.selectAll("rect")									//exit the previous shit and enter other shit
					.remove()
					.exit()
					.data(dataset)

	        bar.enter()	
				.append("rect")
				.attr("x", function(d, i) 
				{
					return margin.left + barPadding + i * (w - barPadding) / dataset.length;
				})
				.attr("y", function(d) 
				{
					return y(d.value)
				})
				.attr("width", w / dataset.length - barPadding)
				.attr("height", function(d) 
				{
					return h-y(d.value)
				}) 
				.attr("fill", "teal");

	        //Update label's position

	        svg.selectAll("text")											//exit the previous shit and enter other shit
					.remove()
					.exit()
					.data(dataset)

	     
			bar.enter()
				.append("text")
				.attr("font-family", "sans-serif")
				.attr("font-size", "11px")
				.attr("fill", "white")
				.attr("text-anchor", "middle")
				.text(function(d) {
					return d.value;
					})
				.attr("x", function(d, i) {
					return (margin.left + barPadding + i * (w - barPadding) / dataset.length) + (w / dataset.length - barPadding)/2;	//each bar's x + half a bar!
					})
				.attr("y", function(d) {
					return y(d.value)+14;
					}); 


		    //experiment with bars

		console.log("axisdeletex:", svg.selectAll(".axis")
			.remove()
			.exit())
		axisdeletex=svg.selectAll("#axis")
			.remove()
			.exit()


		x = d3.scaleBand()
	        .domain(months)
	        .range([0, w]);

    	y = d3.scaleLinear()
			.domain([0, max])
	        .range([h, margin.top]);

		    xAxis = d3.axisBottom(x);
			yAxis = d3.axisLeft(y);
				
			xAxisGroup = svg.append("g")
				.attr('class', 'axis')
				.attr('transform', 'translate('+margin.left+','+h+')')   //needs fix
				.call(xAxis)
				.append("text")             
				.attr("transform",
						"translate(" + (w/2) + " ," + (h + margin.top + 20) + ")")
				.style("text-anchor", "middle")
				.text("Months");
				  
			yAxisGroup = svg.append("g")
				.attr('class', 'axis')
				.attr('transform', 'translate('+margin.left+',0)')
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left)
				//.attr("x",0 - (h / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text("Temperature");  
		
				d3.selectAll(".lolen").text(selectedyear);
		}
	})
	d3.select("#prev").on("click", function()
	{
		console.log("yeararray:", yeararray)
		console.log("attempting to get:", parseInt(selectedyear)-1)
		if (yeararray.includes(parseInt(selectedyear)-1))						// if the next year exists in the data
		{
			console.log("Thank god next exists")

			selectedyear = +(parseInt(selectedyear)-1)
			yearindex =+yearindex-1
			dataset = parentdataset[yearindex].values
			console.log("new selectedyear is ", selectedyear)
			console.log("new yearindex is ", yearindex)
			console.log("NEW dataset: ", dataset)


			max = d3.max(dataset, function(d) 
		    {
		        return +d.value
		    })
			min = d3.min(dataset, function(d) 
			{
				return +d.value
		    })


			console.log("max:", max)
			console.log("min:", min)
			console.log("dataset.length:", dataset.length)

		    var bar = svg.selectAll("rect")											//exit the previous shit and enter other shit
					.remove()
					.exit()
					.data(dataset)

	        bar.enter()	
				.append("rect")
				.attr("x", function(d, i) 
				{
					return margin.left + barPadding + i * (w - barPadding) / dataset.length;
				})
				.attr("y", function(d) 
				{
					return y(d.value)
				})
				.attr("width", w / dataset.length - barPadding)
				.attr("height", function(d) 
				{
					return h-y(d.value)
				}) 
				.attr("fill", "teal");

	        //Update label's position

	        svg.selectAll("text")											//exit the previous shit and enter other shit
					.remove()
					.exit()
					.data(dataset)

	     
			bar.enter()
				.append("text")
				.attr("font-family", "sans-serif")
				.attr("font-size", "11px")
				.attr("fill", "white")
				.attr("text-anchor", "middle")
				.text(function(d) {
					return d.value;
					})
				.attr("x", function(d, i) {
					return (margin.left + barPadding + i * (w - barPadding) / dataset.length) + (w / dataset.length - barPadding)/2;	//each bar's x + half a bar!
					})
				.attr("y", function(d) {
					return y(d.value)+14;
					}); 


		    //experiment with bars

		console.log("axisdeletex:", svg.selectAll(".axis")
			.remove()
			.exit())
		axisdeletex=svg.selectAll("#axis")
			.remove()
			.exit()


		x = d3.scaleBand()
	        .domain(months)
	        .range([0, w]);

    	y = d3.scaleLinear()
			.domain([0, max])
	        .range([h, margin.top]);

		    xAxis = d3.axisBottom(x);
			yAxis = d3.axisLeft(y);
				
			xAxisGroup = svg.append("g")
				.attr('class', 'axis')
				.attr('transform', 'translate('+margin.left+','+h+')')   //needs fix
				.call(xAxis)
				.append("text")             
				.attr("transform",
						"translate(" + (w/2) + " ," + (h + margin.top + 20) + ")")
				.style("text-anchor", "middle")
				.text("Months");
				  
			yAxisGroup = svg.append("g")
				.attr('class', 'axis')
				.attr('transform', 'translate('+margin.left+',0)')
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left)
				//.attr("x",0 - (h / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text("Temperature");  
		
				d3.selectAll(".lolen").text(selectedyear);
		}
	})
});
