import { Component, OnInit }        from '@angular/core';
import { ActivatedRoute }           from '@angular/router'

import { DataService }              from '../services/data.service';
import * as L                       from 'leaflet';
import * as turf                    from '@turf/turf';
import * as randomPoint             from 'random-points-on-polygon'

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

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

  featureCollection                 = {};
  crimeCollection                   = [];

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

  colorsArray = [
    { label: "Anti-social behaviour", color: "#ffffd9" },
    { label: "Bicycle theft", color: "#edf8b1" },
    { label: "Burglary", color: "#c7e9b4" },
    { label: "Criminal damage and arson", color: "#7fcdbb" },
    { label: "Drugs", color: "#41b6c4" },
    { label: "Other crime", color: "#1d91c0" },
    { label: "Other theft", color: "#225ea8" },
    { label: "Possession of weapons", color: "#253494" },
    { label: "Public order", color: "#081d58" },
    { label: "Robbery", color: "#ffffd9" },
    { label: "Shoplifting", color: "#edf8b1" },
    { label: "Theft from the person", color: "#c7e9b4" },
    { label: "Vehicle crime", color: "#7fcdbb" },
    { label: "Violence and sexual offences", color: "#41b6c4" }
  ]



  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      // if (!this.dataService.featuresRaw[params.area]) {
        this.dataService.getCrime(params.area, false)
          .subscribe(data => {
            this.featureCollection[params.area] = data;
            this.dataService.setFeatures(this.featureCollection);

            let combinedLayer = L.geoJSON();
            let colors = this.colors;

            let layer = L.geoJSON(this.featureCollection[params.area], {
              onEachFeature: function(feature) {
                let point = turf.point(feature['geometry']['coordinates']);
                let buffered = turf.buffer(point, 0.15);

                feature.properties.crimes.forEach(function(crime) {
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

            combinedLayer.addTo(this.crimeLayer);
            this.fitBounds = this.crimeLayer.getBounds();

            let crimes = []
            for (let i = 0; i < this.dataService.featuresRaw[params.area].length; i++) {
              let area = this.dataService.featuresRaw[params.area][i];
              crimes = crimes.concat(area.properties.crimes)
            }

            this.crimeCollection = crimes;
          });
      // } else {
      //   let layer = L.geoJSON(this.dataService.featuresRaw[params.area], {
      //     pointToLayer: function (feature, latlng) {
      //       return L.circleMarker(latlng, {
      //         radius: 8,
      //         fillColor: "#ff7800",
      //         color: "#000",
      //         weight: 1,
      //         opacity: 1,
      //         fillOpacity: 0.8
      //       });
      //     }
      //   });
      //
      //   layer.addTo(this.crimeLayer);
      //   this.fitBounds = this.crimeLayer.getBounds();
      //
      //   let crimes = []
      //   for (let i = 0; i < this.dataService.featuresRaw[params.area].length; i++) {
      //     let area = this.dataService.featuresRaw[params.area][i];
      //     crimes = crimes.concat(area.properties.crimes)
      //   }
      //
      //   this.crimeCollection = crimes;
      // }
    });

  }



}
