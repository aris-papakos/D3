import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as L from 'leaflet';


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
  });
  wards = {};
  // LEAFLET OPTIONS
  options = {
  	zoom: 12,
  	center: L.latLng(51.509865, -0.118092)
  };
  layers: any;

  constructor(private http: Http) {

  }

  ngOnInit() {
    this.getGeoJSON()
    .subscribe(data => {

      let wards = L.geoJSON(data ,{
        style: {
          "color": "#ff7800",
          "weight": 5,
          "opacity": 0.65
        };
      });
      this.layers = [
        this.carto,
        wards
      ];
    });
  }

  public getGeoJSON(): Observable<any> {
    return this.http.get("http://localhost:3000/api/lsoa/get")
    .map((res:any) => res.json())
    .catch((error:any) => {
      return Observable.throw(error);
    });
  }

}
