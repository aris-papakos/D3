import { Component, ElementRef,
  OnInit, AfterViewInit, Input,
  OnChanges, SimpleChanges }        from '@angular/core';
import { ActivatedRoute }           from '@angular/router';

import { D3Service, D3, Selection } from 'd3-ng2-service';
import { DataService }              from '../../services/data.service';

//this is component
@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.css']
})
export class StreamComponent implements OnInit, AfterViewInit {

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

    this.d3.select('.stream').select('svg').remove();
    let sortedGraphData = graphInput.currentValue.sort(function(a, b) {
      a = new Date(a['date']['dateString']);
      b = new Date(b['date']['dateString')];
      return a>b ? -1 : a<b ? 1 : 0;
    });

    this.renderGraph(sortedGraphData);
  }

  renderGraph(graphData: any) {
    // D3
    let d3 = this.d3;

    //Stream
    var parent = this.parentNativeElement.querySelector('.stream');

    this.svg = d3.select('.stream').append('svg:svg')
    .attr('id', 'chart')
    .attr('width', parent.offsetWidth)
    .attr('height', parent.offsetHeight)

    let margin = { top: 60, right: 60, bottom: 60, left: 60 };
    let width = parent.offsetWidth - margin.right- margin.left;
    let height = parent.offsetHeight - margin.top - margin.bottom;

    let MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    var z= d3.scaleOrdinal(d3.schemeYlGnBu[9]);
    var x = d3.scaleTime().range([0,width-5]);
    var y = d3.scaleLinear().range([height/1.22,0]);

    var xAxis = d3.axisBottom(x)
      .scale(x)
      .ticks(10);
    var yAxis = d3.axisLeft(y)
      .scale(y)
      .ticks(5);
    var yAxis_right = d3.axisRight(y)
      .scale(y)
      .ticks(5);

    var stream = this.svg.append("g")
      .classed("display",true)
      .attr('transform', 'translate('+margin.left+','+margin.top+')');

/////////////////////////////////////////////////////////////////////////////

    var nested_data = d3.nest()
      .key(function(d) { return d['crimeType']; })
      .entries(graphData);

    //crime categories
    var crime_types = []
    nested_data.forEach(function(key) {
      crime_types.push(key.key)
    });
    crime_types.sort();

    var expensesTotal = d3.nest()
      .key(function(d) { return d['date']['raw']; })
      .key(function(d) { return d['crimeType']; })
      .rollup(function(v:any) { return v.length })
      .object(graphData);

    // put label inside as key and return an array
    var data = Object.keys(expensesTotal).map(function(key) {

      crime_types.forEach(function(type) {
        if (!expensesTotal[key][type]) {
          expensesTotal[key][type] = 0;
        }
      })

      expensesTotal[key].Month = key;
      return expensesTotal[key];
    });
    data['columns'] = crime_types;

/////////////////////////////////////////////////////////////////////////////

    //Date parse
    var dataParser = d3.timeParse("%Y-%m");
    var min_month = 12;
    var min_year = 2015;
    data.forEach(function(d) {
      d.Month = dataParser(d.Month);
      var temp = d.Month ;
      if (temp.getMonth() < min_month && temp.getFullYear() <= min_year ) { min_month = temp.getMonth(); }
      if (temp.getFullYear() < min_year) { min_year = temp.getFullYear(); }
    });

/////////////////////////////////////////////////////////////////////////////

    var maxDateVal = d3.sum(data, function(d) {
      var vals = d3.keys(d).map(function(key) { return key !== 'Month' ? d[key] : 0 });
      return d3.max(vals);
    });
    var maxY= d3.max(data, function(d){
      var vals = d3.keys(d).map(function(key){ return key !== 'Month' ? d[key] : 0 });
      return d3.sum(vals);
    });

    var stack = d3.stack()
      .keys(crime_types)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetWiggle);
      // .offset(d3.stackOffsetWiggle);
      //.order(d3.stackOrderAscending)
    var series = stack(data);

    x.domain(d3.extent(data, function (d) {
      return d.Month;
    }));
    y.domain([0, maxY]);

    var xAxis = d3.axisBottom(x)
      .scale(x);

    var area = d3.area()
     .x(function(d) { return x(d['data']['Month']); })
     .y0(function(d) { return y(d[0]); })
     .y1(function(d) { return y(d[1]); })
     .curve(d3.curveCardinal);
     // .curve(d3.curveBasis);

/////////////////////////////////////////////////////////////////////////////

    function drawAxis(params){

      //plot axis2
      this.append("text")
                  .classed("title", true)
                  .style("fill","black")
                  .attr("transform","translate("+width/3.5+","+-20+")")
                  .text("Mouse-over to Explore Crimes Streamgraph")
                  .style("font-size", "20px");


      // create x axis
      this.append("g")
        .classed("axis x", true)
        .attr('transform', 'translate(0,'+height+')')
        .call(params.axis.x);
      // // create y axis left
      // this.append("g")
      //   .classed("axis y", true)
      //   .attr('transform', 'translate('+-5+','+20+')')
      //   .call(params.axis.y);
      // create y axis right
      this.append("g")
        .classed("y axis2", true)
      //   .attr('transform', 'translate('+width+','+20+')')
      //   .call(params.axis.y2);
     //label of x axis
      this.select(".axis.x")
        .append("text")
        .style("fill","black")
        .classed("x axis-label", true)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/1.9 + "," + 48 + ")")
        .text("Crimes per Month - Area of Interest");
      this.select(".axis.y")
        .append("text")
        .style("fill","black")
        .classed("y axis-label", true)
        .attr("transform", "translate("+-10+"," + height/1.8 +  ") rotate(-90)")
     		.text("Crimes")
        .style("font-size", "20px");
      this.append("g")
        .append("text")
        .classed("chart-header",true)
        .attr("transform", "translate(0,0)")
        .text("");
    }

/////////////////////////////////////////////////////////////////////////////

    function plot(params) {
      drawAxis.call(this, params);
      // enter
      this.selectAll(".layer")
        .data(params.layer)
        .enter()
        .append("path")
        .classed("layer",true);
      //update
      this.selectAll(".layer")
        .attr("d", area)
        .style("fill",function(d, i) { return z(i); })
        .style("stroke", "black")
        .style("opacity",0.5)
      .on("mousemove", function(d,i){
        let mousex = d3.mouse(this)[0];
        var invertedx = x.invert(mousex);
        var amount = invertedx.getMonth()+(invertedx.getFullYear()-min_year)*10-min_month+1;
        var amount_of_crimes =d[amount].data[d.key];
        let invertedDate = MONTH_NAMES[invertedx.getMonth()] +'-'+ invertedx.getFullYear();
        var selected = (d.values);
        var str = d.key+': '+amount_of_crimes+','+'   '+'Date:  '+ invertedDate;
        d3.select(".title")
                        .text("");
        d3.select(".chart-header")
          .text(str);
        d3.select(this)
          .style("opacity",1);
      })
     .on("mouseout",function(d,i){
        d3.select(this)
          .transition()
          .duration(250)
          .style("opacity", 0.5);
        d3.select(".chart-header")
          .text('');
      });
    //exit
    this.selectAll(".layer")
      .data(params.layer)
      .exit()
      .remove();
   }
    //CALL function
    plot.call(stream, {
      data:data,
      axis:{
        x: xAxis,
        y: yAxis,
        y2: yAxis_right
      },
      layer:series
    });


  }

}
