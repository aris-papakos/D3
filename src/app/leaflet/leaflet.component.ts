import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';


@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.css']
})
export class LeafletComponent implements OnInit {

  constructor() { }

  options = {
  	layers: [
  		L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy;<a href="https://carto.com/attribution">CARTO</a>',

      })
  	],
  	zoom: 12,
  	center: L.latLng(51.509865, -0.118092)
  };

  ngOnInit() {
  }

}
