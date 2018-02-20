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
  host: {
    '(document:keydown.arrowLeft)': 'onKeyArrowLeft($event)',
    '(document:keydown.arrowRight)': 'onKeyArrowRight($event)',
    '(window:resize)': 'onResize($event)'
  },
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
  months: string[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];


  constructor(element: ElementRef, private ngZone: NgZone, d3Service: D3Service, private http: Http) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
    let self = this;
    let d3 = this.d3;
    let d3ParentElement: any;

    this.margin = {top: 20, right: 20, bottom: 40, left: 40};

    if (this.parentNativeElement !== null) {
      var parent = this.parentNativeElement.querySelector('.chart');
      this.width = parent.offsetWidth;
      this.height = 500;

      this.svg = d3.select('.chart').append('svg:svg')
      .attr('width', this.width)
      .attr('height', this.height);

      this.http.get("../assets/data/meteo.csv")
        .subscribe(
          data =>  {
            let raw = d3.csvParse(data['_body']);

            this.data = d3.nest()
            .key(function(d) { return d['year']; })
            .key(function(d) { return d['month']; })
            .rollup(function(v) {
              // Compile workaround for Angular2+
              let values: any = {};
              values = {
                avg: d3.mean(v, function(d) { return +d['temperature']; })
              };

              return values;
            })
            .entries(raw);

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

            // Initialize the graph with the first year
            this.selectedYear = '2011';
            this.selectedData = this.data[0];

            this.renderGraph();
        });
      }
    }

    onKeyArrowLeft(event) {
      let yearIndex = this.data.map(function(year) {
        return year.key;
      }).indexOf(this.selectedYear);

      if (yearIndex == 0) return;
      else {
        this.renderData(this.data[yearIndex - 1]);
        this.d3.selectAll(".chart-tooltip").remove();
      }
    }

    onKeyArrowRight(event) {
      let yearIndex = this.data.map(function(year) {
        return year.key;
      }).indexOf(this.selectedYear);

      if (yearIndex == (this.data.length -1)) return;
      else {
        this.renderData(this.data[yearIndex + 1]);
        this.d3.selectAll(".chart-tooltip").remove();
      }
    }

    onResize(event) {
      var parent = this.parentNativeElement.querySelector('.chart');
      this.width = parent.offsetWidth;

      this.svg = this.d3.select('svg')
        .attr('width', this.width);

      this.renderGraph();
    }

    renderGraph() {
      let self = this;
      let d3 = this.d3;
      let d3ParentElement: any;

      this.svg = this.d3.select('svg');
      this.svg.selectAll('*').remove();


      // Set the axes
      this.xScale = d3.scaleBand().domain(
        this['data'][0]['values'].map(function(d) { return +d.key; })
      ).range([this.margin.left, this.width - this.margin.right]),
      this.yScale = d3.scaleLinear().domain([0, (this.max * 1.1)]).rangeRound([this.height - this.margin.bottom, this.margin.top]);

      // Draw Axes
      this.svg.append("g")
        .attr("class", "chart-axis")
        .attr("transform", "translate(0," + (this.height - this.margin.bottom) + ")")
        .call(d3.axisBottom(this.xScale).tickSize(0).tickFormat((d, data) => {
          return this.months[+d - 1]
        }));

      this.svg.append("g")
       .attr("class", "chart-grid")
       .attr('transform', 'translate(' + this.margin.left + ', 0)')
       .call(d3.axisLeft(this.yScale).ticks(12).tickSize(-(this.width - this.margin.left  - this.margin.right)));

      // Create bars with individual classes, needed for transitions
      for (let i = 0; i< this.selectedData['values'].length; i++) {
        let data = this.selectedData['values'][i];

        this.svg.append("rect")
          .attr("class", function() {
            return 'chart-bar bar' + i
          })
          .attr("x", this.xScale(+data['key']))
          .attr("width", this.xScale.bandwidth())
          .attr("y", this.yScale(data['value']['avg']))
          .attr("height", this.height - this.margin.bottom - this.yScale(data['value']['avg']))
          .attr("fill",
            'rgba(192, 57, 43,'+ (0.10 * (data['value']['avg'] / this.groupWidth) + 0.10) + ')'
          )
          .on("mouseover", (data) => {
            let values = this.selectedData['values'][i];
            let columnWidth = ((this.width - this.margin.left - this.margin.right) / this.selectedData['values'].length) / 2

            this.svg.append("text")
              .attr("class", "chart-tooltip")
              .attr("x", this.xScale(+values['key']) + columnWidth)
              .attr("y", this.yScale(+values['value']['avg']) - 10)
              .style("font-size", "12px")
              .style("fill", "rgb(0, 0, 0)")
              .text(values['value']['avg'].toFixed(1))
              .attr("text-anchor", "middle");

          })
          .on("mouseout", (data) => {
            // Remove previous text
            this.d3.selectAll(".chart-tooltip").remove();
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

      let svg = this.d3.select('.chart').transition();

      for (let i = 0; i< this.selectedData['values'].length; i++) {
        let data = this.selectedData['values'][i];
        let bar = ".bar" + i;

        svg.select(bar)
          .duration(250)
          .attr("fill", 'rgba(192, 57, 43,'+ (0.10 * (data['value']['avg'] / groupWidth) + 0.10) + ')')
          .attr("y", yScale(data['value']['avg']))
          .attr("height", height - margin.bottom - yScale(data['value']['avg']));
      }
    }

}
