import { Component, ElementRef, NgZone, OnDestroy, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';
import { Http, Response } from '@angular/http';

import {
  D3Service,
  D3,
  Axis,
  BrushBehavior,
  BrushSelection,
  D3BrushEvent,
  ScaleLinear,
  ScaleOrdinal,
  Selection,
  Transition
} from 'd3-ng2-service';

@Component({
  selector: 'app-temperature',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css']
})
export class TemperatureComponent implements OnInit {
  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;

  // D3
  data: any = [];
  min: number;
  max: number;
  groupWidth: number;
  svg: any;
  margin: {
    top: number,
    right: number,
    bottom: number,
    left: number
  };
  width: number;
  height: number;
  xScale: any;
  yScale: any;

  selectedYear: string;
  selectedData: any = [];

  constructor(element: ElementRef, private ngZone: NgZone, d3Service: D3Service, private http: Http) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
    let self = this;
    let d3 = this.d3;
    let d3ParentElement: any;

    if (this.parentNativeElement !== null) {
      // let parent = d3.select('chart');
      var parent = this.parentNativeElement.querySelector('.chart');
      this.width = parent.offsetWidth / 2;
      this.height = 500;

      this.svg = d3.select('.chart').append('svg:svg')
      .attr('width', this.width)
      .attr('height', this.height);

      this.margin = {top: 20, right: 20, bottom: 30, left: 40};

      this.http.get("../assets/data/meteo.csv")
        .subscribe(
          data =>  {
            let raw = d3.csvParse(data['_body']);

            this.data = d3.nest()
            .key(function(d) { return d['year']; })
            .key(function(d) { return d['month']; })
            .rollup(function(v) { return {
              avg: d3.mean(v, function(d) { return +d['temperature']; })
            }; })
            .entries(raw);

            console.log(this.data)

            this.max = d3.max(this.data, function(d) {
              return d3.max(d['values'], function(dx) {
                return +dx['value']['avg'];
              });
            });

            this.min = d3.min(this.data, function(d) {
              return d3.min(d['values'], function(dx) {
                return +dx['value']['avg'];
              });
            });

            this.groupWidth = (this.max - this.min) / 4;

            // Set the axes
            this.xScale = d3.scaleBand().domain(
              this['data'][0]['values'].map(function(d) { return +d.key; })
            ).range([this.margin.left, this.width - this.margin.right]),
            this.yScale = d3.scaleLinear().domain([0, (this.max * 1.1)]).rangeRound([this.height - this.margin.bottom, this.margin.top]);

            // Draw Axes
            this.svg.append("g")
              .attr("class", "chart-axis")
              .attr("transform", "translate(0," + (this.height - this.margin.bottom) + ")")
              .call(d3.axisBottom(this.xScale).tickSize(0).tickFormat(function(d) {
                let months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                return months[d - 1];
              }));

            this.svg.append("g")
             .attr("class", "chart-axis")
             .attr('transform', 'translate(' + this.margin.left + ', 0)')
             .call(d3.axisLeft(this.yScale).ticks(4));

            this.svg.append("g")
             .attr("class", "chart-grid")
             .attr('transform', 'translate(' + this.margin.left + ', 0)')
             .call(d3.axisLeft(this.yScale)
               .ticks(12)
               .tickSize(-(this.width - this.margin.left  - this.margin.right))
               .tickFormat("")
             );

            // Initialize the graph with the first year
            this.selectedYear = '2011';
            this.selectedData = this.data[0];

            // Create bars with individual classes, needed for transitions
            for (let i = 0; i< this.selectedData['values'].length; i++) {
              var data = this.selectedData['values'][i];

              this.svg.append("rect")
                .attr("class", function() {
                  return 'chart-bar bar' + i
                })
                .attr("transform", "translate(0," + this.margin.top + ")")
                .attr("x", this.xScale(+data['key']))
                .attr("fill",
                  'rgba(192, 57, 43,'+ (0.10 * (data['value']['avg'] / this.groupWidth) + 0.10) + ')'
                )
                .attr("width", (this.width - this.margin.left - this.margin.right) / this.selectedData.values.length)
                .attr("height", 0)
                .attr("y", this.yScale(data['value']['avg']))
                .attr("height", this.height - this.margin.top - this.margin.bottom - this.yScale(data['value']['avg']))
                .on("mouseover", (data) => {
                  let data = this.selectedData['values'][i];
                  let columnWidth = ((this.width - this.margin.left - this.margin.right) / this.selectedData['values'].length) / 2

                  this.svg.append("text")
                    .attr("class", "chart-tooltip")
                    .attr("x", this.xScale(+data['key']) + columnWidth)
                    .attr("y", this.yScale(+data['value']['avg']))
                    .style("font-size", "12px")
                    .style("fill", "rgba(0, 0, 0, 0.48)")
                    .text(data['value']['avg'].toFixed(1))
                    .attr("text-anchor", "middle");

                })
                .on("mouseout", (data) => {
                  // Remove previous text
                  this.d3.selectAll(".chart-tooltip").remove();
                });
            }
        });
      }
    }

    renderData(year): void {
      this.selectedYear = year['key'];
      this.selectedData = year;

      let xScale = this.xScale;
      let yScale = this.yScale;
      let margin = this.margin;
      let width = this.width;
      let height = this.height;
      let groupWidth = this.groupWidth;

      let svg = this.d3.select('.chart').transition()

      for (let i = 0; i< this.selectedData['values'].length; i++) {
        let data = this.selectedData['values'][i];
        let bar = ".bar" + i;

        svg.select(bar)
          .duration(250)
          .attr("fill",
            'rgba(192, 57, 43,'+ (0.10 * (data['value']['avg'] / groupWidth) + 0.10) + ')'
          )
          .attr("y", yScale(data['value']['avg']))
          .attr("height", function() { return (height - margin.top - margin.bottom) - yScale(data['value']['avg']); });
      }
    }

}
