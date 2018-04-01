import { Component, ElementRef,
  OnInit, Input,OnChanges,
  SimpleChange, SimpleChanges }     from '@angular/core';
import { ActivatedRoute }           from '@angular/router'

import { D3Service, D3, Selection } from 'd3-ng2-service';
import { DataService }              from '../../services/data.service';


@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.css']
})
export class RadarComponent implements OnInit {

  @Input() graphInput: any;

  // D3
  private d3: D3;
  private parentNativeElement: any;

  width:number;
  height:number;
  margin:any = {};

  area: string;
  svg: any;

  graphData = [];

  constructor(private dataService: DataService, element: ElementRef, d3Service: D3Service , private route: ActivatedRoute) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;

    // declare var RadarChart:any;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.area = params.area;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const graphInput: SimpleChange = changes.graphInput;

    this.d3.select('.radar').select('svg').remove();

    this.renderGraph(graphInput.currentValue);
  }

  renderGraph(graphData: any) {
    // D3
    let d3 = this.d3;
    var parent = this.parentNativeElement.querySelector('.radar');

    // Radar
    this.margin = { top: 100, right: 100, bottom: 100, left: 100 };
    let margin = this.margin;
    this.width = parent.offsetWidth - margin.left - margin.right;
    this.height = parent.offsetHeight - margin.top - margin.bottom;

    let width = Math.min(this.width, this.height);
    let height = Math.min(this.width, this.height);

    this.svg = d3.select('.radar').append('svg:svg')
      .attr('width', parent.offsetWidth)
      .attr('height', parent.offsetHeight)

    let rawData = graphData.map(function(d){
      return { crime: d['crimeType'] }
    });

    //Calculate total number of crimes (needed for calculating fraction)
		var total = rawData.length

    //data preprocessing
		var data = d3.nest()
			.key(function(d:any) { return d['crimeType']; })
			.rollup(function(v:any) { return +d3.format(".2f")( v.length / total);})
			.entries(graphData);

      console.log(data)

			//Average crime data of London (Dummy Data)
		var londonAVG = [//London Average
			{key: 'Anti-social behaviour', value:0.23},
			{key: 'Violence and sexual offences', value:0.21},
			{key: 'Other theft', value:0.11},
			{key: 'Vehicle crime', value:0.09},
			{key: 'Burglary', value:0.07},
			{key: 'Criminal damage and arson', value:0.06},
			{key: 'Public order', value:0.05},
			{key: 'Shoplifting', value:0.05},
			{key: 'Theft from the person', value:0.04},
			{key: 'Drugs', value:0.03},
			{key: 'Robbery', value:0.03},
			{key: 'Bicycle theft', value:0.02},
			{key: 'Other crime', value:0.01},
			{key: 'Possession of weapons', value:0.01}
		];

    //Sort crimes based on top crimes of area of interest
    function compare(a,b) {
    	if (b.value - a.value > 0)
    		return 1;
    	if (b.value - a.value < 0)
    		return -1;
    	return 0;
    };
    data.sort(compare);

    //Only choose categories of London Average that are in the query data
		var londonArray = []
		for (let i = 0; i < londonAVG.length; i++) {
			for (let j = 0; j < data.length; j++) {
				if (londonAVG[i].key === data[j].key) {
					londonArray.push(londonAVG[i]);
				}
			 };
    };
		//Add crime data of area of interest and London to dataArray
		var dataArray = [];
		dataArray.push(data);
		dataArray.push(londonArray);
		//dataArray[0].sort(compare);
		//Show only top 6 crime categories (or less)
		dataArray[0].splice(6)
		dataArray[1].splice(6)
		//Call function to draw the Radar chart
		this.radarChart(".radar", dataArray);

    let colorscale:any = d3.scaleOrdinal(["rgba(40, 181, 196, 0.5)","rgba(35, 0, 89, 0.5)"])

    //Legend titles
    var LegendOptions = ['Area of Interest', 'London Average'];
    var svg = d3.select('.radar')
    	.selectAll('svg')
    	.append('svg')
    	.attr("width", width*5)
    	.attr("height", height*5)
    //Initiate Legend
    var legend = svg.append("g")
    	.attr("class", "legend")
    	//.attr('transform', 'translate(90,20)');
      .attr('transform', 'translate(270,425)');
  	//Create colour squares
  	legend.selectAll('rect')
  	  .data(LegendOptions)
  	  .enter()
  	  .append("rect")
  	  //.attr("x", width)
      .attr("x", width)
  	  //.attr("y", function(d, i){ return i * 20;})
      .attr("y", function(d, i){ return i * 20;})
  	  .attr("width", 10)
  	  .attr("height", 10)
  	  .style("fill", function(d, i){ return colorscale(i);});
		//Create text next to squares
    legend.selectAll('text')
      .data(LegendOptions)
      .enter()
      .append("text")
      .attr("x", width+15)
      .attr("y", function(d, i){ return i * 20 + 9;})
      .attr("font-size", "11px")
      .attr("fill", "#737373")
      .text(function(d) { return d; });

  }

  radarChart(id, data) {
    let d3 = this.d3;

  	var cfg = {
  	 w: this.width,				//Width of the circle
  	 h: this.height,				//Height of the circle
  	 margin: this.margin, //The margins of the SVG
  	 levels: 0,				//How many levels or inner circles should there be drawn
  	 maxValue: 0,			//What is the value that the biggest circle will represent
  	 labelFactor: 1.50, 	//How much farther than the radius of the outer circle should the labels be placed
  	 wrapWidth: 90, 		//The number of pixels after which a label needs to be given a new line
  	 opacityArea: 0.4, 	//The opacity of the area of the blob
  	 dotRadius: 4, 			//The size of the colored circles of each blob
  	 opacityCircles: 0.3, 	//The opacity of the circles of each blob
  	 strokeWidth: 2, 		//The width of the stroke around each blob
  	 roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
  	 //color: d3.scaleOrdinal(d3.schemeCategory20c).domain(d3.range(0, 10))	//Color function
  	};

    let color:any = d3.scaleOrdinal(["rgba(40, 181, 196, 0.5)","rgba(35, 0, 89, 0.5)"])	//Color function

  	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
  	var maxValue = Math.ceil(
      (Math.max(cfg['maxValue'], d3.max(data, function(i:any) {
        return d3.max(i.map(function(o:any){
          return o.value;
        }));
      })) * 10)) / 10;

    //Show level in Interval of 0.1
    cfg.levels = Math.ceil(maxValue*10);

  	var allAxis = (data[0].map(function(i, j){return i.key})),	//Names of each axis
  		total = allAxis.length,					//The number of different axes
  		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
  		Format = d3.format('.0%'),			 	//Percentage formatting
  		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

  	//Scale for the radius
  	var rScale = d3.scaleLinear()
  		.range([0, radius])
  		.domain([0, maxValue]);

  	/////////////////////////////////////////////////////////
  	//////////// Create the container SVG and g /////////////
  	/////////////////////////////////////////////////////////

  	//Remove whatever chart with the same id/class was present before
  	d3.select(id).select("svg").remove();

  	//Initiate the radar chart SVG
  	var svg = d3.select(id).append("svg")
  			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
  			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
  			.attr("class", "radar"+id);

  	//Append a g element
  	var g = svg.append("g")
  			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

    //Filter for the outside glow
  	var filter = g.append('defs').append('filter').attr('id','glow'),
  		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
  		feMerge = filter.append('feMerge'),
  		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
  		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

  	//Wrapper for the grid & axes
  	var axisGrid = g.append("g").attr("class", "axisWrapper");

  	//Draw the background circles
  	axisGrid.selectAll(".levels")
  	   .data(d3.range(1,(cfg.levels+1)).reverse())
  	   .enter()
  		.append("circle")
  		.attr("class", "gridCircle")
  		.attr("r", function(d, i){return radius/cfg.levels*d;})
  		.style("fill", "grey")
      .style("stroke", "grey")
  		.style("fill-opacity", cfg.opacityCircles)
  		.style("filter" , "url(#glow)");

  	//Text indicating at what % each level is
  	axisGrid.selectAll(".axisLabel")
  	   .data(d3.range(1,(cfg.levels+1)).reverse())
  	   .enter().append("text")
  	   .attr("class", "axisLabel")
  	   .attr("x", 5)
  	   .attr("y", function(d){return -d*radius/cfg.levels;})
  	   .attr("dy", "0.4em")
  	   .style("font-size", "10px")
       .style("font-weight", "bold")
  	   .attr("fill", "#black")
  	   .text(function(d,i) { return Format(maxValue * d/cfg.levels);});


    //draw the axes

  	//Create the straight lines radiating outward from the center
  	var axis = axisGrid.selectAll(".axis")
  		.data(allAxis)
  		.enter()
  		.append("g")
  		.attr("class", "axis");
  	//Append the lines
  	axis.append("line")
  		.attr("x1", 0)
  		.attr("y1", 0)
  		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
  		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
  		.attr("class", "line")
  		.style("stroke", "white")
  		.style("stroke-width", "2px");

  	//Append the labels at each axis
  	axis.append("text")
  		.attr("class", "legend")
  		.style("font-size", "10px")
      .style("font-weight", "bold")
  		.attr("text-anchor", "middle")
  		.attr("dy", "0.25em")
  		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
  		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
  		.text(function(d:any){return d})
  		.call(wrap, cfg.wrapWidth);



  //draw chart blobs

  //The radial line function
  var radarLine = d3.radialLine()
    .curve(d3.curveLinearClosed)
    .radius(function(d:any) { return rScale(d['value']); })
    .angle(function(d,i) {	return i*angleSlice; });

  if(cfg.roundStrokes) {
    radarLine.curve(d3.curveCardinalClosed);
  }

  //variable needed for coloring circles
  let j:number = -1;

  //Create a wrapper for the blobs
  var blobWrapper = g.selectAll(".radarWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarWrapper");

  //Append the backgrounds
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", function(d:any, i) { return radarLine(d); })
    .style("fill", function(d, i:number) { return color(i); })
    .style("fill-opacity", cfg.opacityArea)
    .on('mouseover', function (d,i){
      //Dim all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", 0.1);
      //Bring back the hovered over blob
      d3.select(this)
        .transition().duration(200)
        .style("fill-opacity", 0.7);
    })
    .on('mouseout', function(){
      //Bring back all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  //Create the outlines
  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", function(d:any, i) { return radarLine(d); })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", function(d,i) { return color(i); })
    .style("fill", "none")
    .style("filter" , "url(#glow)");

  //Append the circles
  blobWrapper.selectAll(".radarCircle")
    .data(function(d:any,i) { return d; })
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", function(d,i){return rScale(d['value']) * Math.cos(angleSlice*i - Math.PI/2); })
    .attr("cy", function(d,i){return rScale(d['value']) * Math.sin(angleSlice*i - Math.PI/2); })
    //coloring circles - color hack
    .style("fill", function(d:string, i:any) {
      if (i == 0) {
        j++
      };
      return color(j);
    })
    .style("fill-opacity", 0.99);

  //Wrapper for the invisible circles on top
  var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarCircleWrapper");

  //Append a set of invisible circles on top for the mouseover pop-up
  blobCircleWrapper.selectAll(".radarInvisibleCircle")
    .data(function(d:any, i) { return d; })
    .enter().append("circle")
    .attr("class", "radarInvisibleCircle")
    .attr("r", cfg.dotRadius*1.5)
    .attr("cx", function(d,i){ return rScale(d['value']) * Math.cos(angleSlice*i - Math.PI/2); })
    .attr("cy", function(d,i){ return rScale(d['value']) * Math.sin(angleSlice*i - Math.PI/2); })
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function(d,i) {
      let newX =  parseFloat(d3.select(this).attr('cx')) - 10;
      let newY =  parseFloat(d3.select(this).attr('cy')) - 10;

      tooltip
        .attr('x', newX)
        .attr('y', newY)
        .text(Format(d['value']))
        .transition().duration(200)
        .style('opacity', 1);
    })
    .on("mouseout", function(){
      tooltip.transition().duration(200)
        .style("opacity", 0);
    });

    //Set up the small tooltip for when you hover over a circle
    var tooltip = g.append("text")
      .attr("class", "tooltip")
      .style("opacity", 0);



    //Helper function taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
      text.each(function() {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy"));

      let tspan:any = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
      });
    }
  }


}
