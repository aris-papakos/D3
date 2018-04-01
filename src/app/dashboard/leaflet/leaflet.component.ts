import { Component,
  ChangeDetectorRef, OnInit }       from '@angular/core';
import { DataService }              from '../../services/data.service'
import { Observable }               from 'rxjs/Rx';
import { Subject }                  from 'rxjs/Subject';

import * as L                       from 'leaflet';
import * as turf                    from '@turf/turf';
import * as randomPoint             from 'random-points-on-polygon'


@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.css']
})

export class LeafletComponent implements OnInit {

  private alive                     : boolean = true;

  // LAYERS
  cartoLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy;<a href="https://carto.com/attribution">CARTO</a>',
  })
  crimeLayer = L.geoJSON();
  // LEAFLET OPTIONS
  options = {
  	zoom: 10,
  	center: L.latLng(51.509865, -0.118092)
  };
  layers = [
    this.cartoLayer,
    this.crimeLayer
  ]
  fitBounds:any = null;

  // COLLECTIONS
  wards = {};

  colors = {
    "Anti-social behaviour": "#ffffd9",
    "Bicycle theft": "#edf8b1",
    "Burglary": "#c7e9b4",
    "Criminal damage and arson": "#7fcdbb",
    "Drugs": "#41b6c4",
    "Other crime": "#1d91c0",
    "Other theft": "#225ea8",
    "Possession of weapons": "#253494",
    "Public order": "#081d58",
    "Robbery": "#ffffd9",
    "Shoplifting": "#edf8b1",
    "Theft from the person": "#c7e9b4",
    "Vehicle crime": "#7fcdbb",
    "Violence and sexual offences": "#41b6c4"
  };

  constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {
    dataService.features$.takeWhile(() => this.alive).subscribe(features=> {

      let combinedLayer = L.geoJSON();
      let colors = this.colors;
      let count = 0;

      for (let i in features) {
        for (let x in features[i]) {
          let layer = L.geoJSON(features[i][x], {
            onEachFeature: function(feature) {
              let point = turf.point(feature['geometry']['coordinates']);
              let buffered = turf.buffer(point, 0.15);

              feature.properties.crimes.forEach(function(crime) {
                count++

                let random = randomPoint(1, buffered);
                let position = L.latLng(random[0].geometry.coordinates[1], random[0].geometry.coordinates[0])

                let marker =  L.circleMarker(position, {
                    radius: 3,
                    fillColor: colors[crime.crimeType],
                    color: colors[crime.crimeType],
                    weight: 0,
                    opacity: 1,
                    fillOpacity: 0.8
                  });

                marker.addTo(combinedLayer);
              })
            }
          });

          layer.addTo(combinedLayer);
        };
      }

      this.crimeLayer.clearLayers();
      combinedLayer.addTo(this.crimeLayer);
      this.fitBounds = this.crimeLayer.getBounds();
      console.log(count)
    });

  }

  ngOnInit() {
    this.dataService.getWards()
    .subscribe(data => {
      this.wards = L.geoJSON(data);
      let length = data.length;
      let names = [];
      for (let i = 0; i < length; i++) {
        names.push(data[i].properties.name);
      }

      this.dataService.setWardNames(names);
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
