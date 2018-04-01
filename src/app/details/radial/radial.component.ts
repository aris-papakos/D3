import { Component, ElementRef,
  OnInit, Input, OnChanges,
  SimpleChange, SimpleChanges }     from '@angular/core';
import { ActivatedRoute }           from '@angular/router';


import { D3Service, D3, Selection } from 'd3-ng2-service';
import { DataService }              from '../../services/data.service';

@Component({
  selector: 'app-radial',
  templateUrl: './radial.component.html',
  styleUrls: ['./radial.component.css']
})
export class RadialComponent implements OnInit, OnChanges {

  @Input() graphInput: any;

  // D3
  private d3: D3;
  private parentNativeElement: any;

  area: string;
  svg: any;

  graphData = [];

  constructor(private dataService: DataService, element: ElementRef, d3Service: D3Service , private route: ActivatedRoute) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.area = params.area;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const graphInput: SimpleChange = changes.graphInput;

    this.d3.select('.radial').select('svg').remove();

    this.renderGraph(graphInput.currentValue)
  }


  renderGraph(graphData: any) {
    // D3
    let d3 = this.d3;
    let radial = {
      width: 0,
      height: 0
    };
    var parent = this.parentNativeElement.querySelector('.radial');

    // Radial

    radial['width'] = parent.offsetWidth;
    radial['height'] = parent.offsetHeight;
    radial['margin'] = { top: 40, right: 80, bottom: 40, left: 40 },
    radial['innerRadius'] = 20,
    radial['chartWidth'] = radial.width - radial['margin'].left - radial['margin'].right,
    radial['chartHeight'] = radial.height - radial['margin'].top - radial['margin'].bottom,
    radial['outerRadius'] = (Math.min(radial['chartWidth'], radial['chartHeight']) / 2),

    this.svg = d3.select('.radial').append('svg:svg')
    .attr('width', radial.width)
    .attr('height', radial.height)
    // .attr("transform", "translate(" + radial.width / 2 + "," + radial.height / 2 + ")");

    let g = this.svg.append("g").attr("transform", "translate(" + radial.width / 2 + "," + radial.height / 2 + ")");


    var tooltip = d3.select(".radial").append("div").attr("class", "toolTip");
    var angle = d3.scaleLinear()
        .range([0, 2 * Math.PI]);
    var radius = d3.scaleLinear()
        .range([radial['innerRadius'], radial['outerRadius']]);
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0);
    var y = d3.scaleLinear() //you can try scaleRadial but it scales differently
        .range([radial['innerRadius'], radial['outerRadius']]);
    var z = d3.scaleOrdinal(d3.schemeYlGnBu[9]);

    var expensesTotal = d3.nest()
      .key(function(d) { return d['date']['raw'].split("-")[1]; })
      .key(function(d) { return d['crimeType']; })
      .rollup(function(v:any) { return v.length; })
      .object(graphData);

    for (let i in expensesTotal) {
      var t = 0;
      for (let j in expensesTotal[i]) {
        t += expensesTotal[i][j];
      }
      expensesTotal[i].total = t; //append new key 'total' to estimate
    }

    var numYears = d3.nest()
      .key(function(d) { return d['date']['raw'].split("-")[0]; })
      .rollup(function(v:any) { return v.length; })
    	.entries(graphData)
    	.length;

  	var nested_data = d3.nest()
      .key(function(d) { return d['crimeType']; })
      .entries(graphData);

    var crime_types = []
    nested_data.forEach(function(key) {
      crime_types.push(key.key)
    });

    crime_types.sort() //sort to ensure same

    // put label inside as key and return an array
    var data = Object.keys(expensesTotal).map(function(key) {
      expensesTotal[key].label = key;
      return expensesTotal[key];
    });
    data['columns'] = crime_types;
    // sort by months
    data.sort(function(a, b) {
	    var textA = a.label;
	    var textB = b.label;
	    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		});
    // time to plugin 2nd function as plain code
    let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    x.domain(data.map(function(d) { return d.label; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);
    // z.domain(data.columns.slice(1));
    z.domain(data['columns']);

    // Extend the domain slightly to match the range of [0, 2π].
    angle.domain([0, d3.max(data, function(d,i) { return i + 1; })]);
    radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
    let angleOffset = -360.0/ data.length /2;

    g.append("g")
      .selectAll("g")
      .data(d3.stack().keys(data['columns'])(data))
      .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
      .style("fill-opacity", 0.5)
      .attr("identifier", function(d) { return d.key; })
      .selectAll("path")
      .data(function(d) { return d; })
      .enter().append("path")
      .attr("class","rosendaleArc")
      .attr("d", d3.arc()
      .innerRadius(function(d) { return y(d[0]); })
      .outerRadius(function(d) { return y(d[1]); })
      .startAngle(function(d) { return x(d['data']['label']); })
      .endAngle(function(d) { return x(d['data']['label']) + x.bandwidth(); })
      .padAngle(0.01)
      .padRadius(radial['innerRadius']))
      .attr("transform", function(d) {return "rotate("+ angleOffset + ")"})
      .on('mouseover', function (d){
      	d3.selectAll(".rosendaleArc")
      	.transition().duration(200)
      	.style("fill-opacity", 0.5);

        d3.select(this)
    			.transition().duration(200)
    			.style("fill-opacity", 1);

    var crimeType = d3.select(this.parentNode).datum()['key'];
    tooltip
      .style("position","absolute")
      .style("background",'none repeat scroll 0 0 #DCDCDC')
      .style("border","1px solid #6F257F")
      .style("border-radius","15px")
      .style("padding",'14px')
      .style("text-align", 'center')
      .style("min-width", '80px')
      .style("height", "auto")
      .style("left", d3.event.pageX - 50 + "px")
      .style("top", d3.event.pageY - 85 + "px")
      .style("z-index", 1)
      .style("display", "inline-block")
      .style("min-width","80px")
      .html( crimeType + "<br>" + ( d[1] - d[0]) / numYears +" on average");
    })
		.on("mouseout", function(){
    	d3.selectAll(".rosendaleArc")
				.transition().duration(200)
				.style("fill-opacity", 0.5);
      tooltip.style("display", "none");
		});

    var label = g.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { return "rotate(" + ((x(d.label) + x.bandwidth() / 2) * 180 / Math.PI - (90-angleOffset)) + ")translate(" + (radial['outerRadius'] + 30) + ",0)"; });

    label.append("text")
      .attr("transform", function(d) { return (x(d.label) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
      .text(function(d) { return months[d.label-1]; })
      .style("font-size",14);
  }

}
