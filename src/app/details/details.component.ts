import { Component, OnInit }        from '@angular/core';

import { DataService }              from '../services/data.service';
import * as L                       from 'leaflet';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, AfterViewInit {

  // Leaflet
  cartoLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy;<a href="https://carto.com/attribution">CARTO</a>',
  })
  crimeLayer = L.geoJSON();
  layers = [
    this.cartoLayer,
    this.crimeLayer
  ]
  fitBounds:any = null;
  // Leaflet options
  options = {
    zoom: 10,
    center: L.latLng(51.509865, -0.118092)
  };

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    // Leaflet
    if (this.dataService.featuresRaw['home']) {
      let layer = L.geoJSON(this.dataService.featuresRaw['home'], {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        }
      });

      layer.addTo(this.crimeLayer);
      this.fitBounds = this.crimeLayer.getBounds();
    }

  }



}
