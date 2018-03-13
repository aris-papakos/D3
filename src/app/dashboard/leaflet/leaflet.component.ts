import { Component, OnInit }        from '@angular/core';
import { DataService }              from '../../services/data.service'
import * as L                       from 'leaflet';


@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.css']
})

export class LeafletComponent implements OnInit {
  // LAYERS
  carto = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy;<a href="https://carto.com/attribution">CARTO</a>',
  })
  // LEAFLET OPTIONS
  options = {
  	zoom: 10,
  	center: L.latLng(51.509865, -0.118092)
  };
  layers = [
    this.carto
  ]

  // WARDS
  wards = {};

  constructor(private dataService: DataService) { }

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
      // this.layers.push(wards);
    });
  }

}
