import { Component,
  ChangeDetectorRef, OnInit }       from '@angular/core';
import { DataService }              from '../../services/data.service'
import { Observable }               from 'rxjs/Rx';
import { Subject }                  from 'rxjs/Subject';

import * as L                       from 'leaflet';


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
  fitBounds = null;


  // COLLECTIONS
  wards = {};
  // private crimeList                 = new Subject<any>();

  constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {
    dataService.features$.takeWhile(() => this.alive).subscribe(features=> {

      let combinedLayer = L.geoJSON()

      for (let x in features) {
        let layer = L.geoJSON(features[x], {
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

        layer.addTo(combinedLayer);
      }

      this.crimeLayer.clearLayers();
      combinedLayer.addTo(this.crimeLayer);
      // this.crimeList.next(combinedLayer)
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

    // this.crimeList.subscribe(value => {
    //   console.log(value);
  	// 	this.fitBounds = value.getBounds();
    //   this.changeDetector.detectChanges();
    // })
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
