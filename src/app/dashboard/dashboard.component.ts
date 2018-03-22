import { Component, OnInit }        from '@angular/core';

import { Validators, FormGroup,
  FormArray, FormBuilder }          from '@angular/forms';
import {Router}                     from '@angular/router';


import { Observable }               from 'rxjs/Observable';
import { startWith }                from 'rxjs/operators/startWith';
import { map }                      from 'rxjs/operators/map';


import { DataService }              from '../services/data.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private alive                     : boolean = true;
  wardNames                         = [];
  modeNames                         = [
    'walking', 'bicycling', 'transit', 'driving'
  ]

  formGroup                         : FormGroup;

  featureCollection                 = {
    areas: [],
    routes: []
  };
  crimeList                         = {
    asbo                              : 0,
    shoplifting                       : 0,
    robbery                           : 0,
  }

  transportation = null;
  segments                          = [];
  filters                           = [];
  locationTypes                     = [
    { 'label': 'Home', 'value': 'home' },
    { 'label': 'Work', 'value': 'work' },
    { 'label': 'Leisure', 'value': 'leisure' }
  ]

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


  constructor(private dataService: DataService, private fb: FormBuilder, private router: Router) {
    dataService.wardNames$.takeWhile(() => this.alive).subscribe(wardNames=> {

      for (let i = 0; i < wardNames.length; i++) {
        this.wardNames.push(wardNames[i])
      }
    });
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      transportation: [''],
      locations: this.fb.array([
          this.initLocation(0),
      ])
    });

    this.formGroup.get('transportation').valueChanges
    .debounceTime(500)
    .subscribe(value => {
      this.transportation = value;
    });
  }

  initLocation(i: number) {
    this.filters[i] = new Observable<string[]>;
    this.segments[i] = { 'label': null, 'type': null, 'ward': '', 'loading': false }

    let group = this.fb.group({
      label: [''],
      type: [null],
      ward: [''],
    });

    group.get('label').valueChanges
    .debounceTime(500)
    .subscribe(value => {
      this.segments[i].label = value;
    });

    group.get('type').valueChanges
    .debounceTime(500)
    .subscribe(value => {
      this.segments[i].type = value;
    });

    group.get('ward').valueChanges
    .debounceTime(500)
    .subscribe(value => {
      if (this.wardNames.indexOf(value) > -1) {
        this.segments[i].loading = true;
        this.segments[i].ward = value;
        this.dataService.getCrime(value)
          .subscribe(data => {
            this.segments[i].loading = false;
            this.featureCollection.areas[i] = data;
            this.dataService.setFeatures(this.featureCollection);
          });

        // var _pairs = [];
        // for (let o = 0; o < this.segments.length; o++){
        //   let selectedNow = this.segments[o].ward;
        //
        //   for (let j = 0; j < this.segments.length;j++){
        //
        //     if (selectedNow == this.segments[j].ward) {/*ignore*/ }
        //
        //     else {
        //       let combination = [selectedNow, this.segments[j].ward];
        //
        //       if (_pairs.indexOf(combination) == -1 && _pairs.indexOf([combination[1], combination[0]]) == -1) {
        //         _pairs.push(combination);
        //       }
        //     }
        //   }
        // }

        // console.log(_pairs)

        // if (this.transportation != null && _pairs.length > 0) {
        //
        //   for (let n = 0; n < _pairs.length; n++ ) {
        //     this.dataService.getRoute(this.transportation, _pairs[n][0], _pairs[n][1])
        //     .subscribe(data => {
        //       this.featureCollection.routes = []
        //       this.featureCollection.routes.push(data);
        //       // this.dataService.setFeatures(this.featureCollection);
        //     });
        //   }
        // }
      }
    });

    this.filters[i] = group.get('ward').valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter('ward', val))
      );

    return group;
  }

  addLocation() {
    let control = <FormArray>this.formGroup.controls['locations'];
    control.push(this.initLocation(control.length));
  }

  removeLocation(i: number) {
    let control = <FormArray>this.formGroup.controls['locations'];
    control.removeAt(i);
    this.featureCollection.area.removeAt(i)
    this.dataService.setFeatures(this.featureCollection);
  }

  showDetails(i: number) {
    let ward = this.segments[i].ward;
    if (this.wardNames.indexOf(ward) > -1) {
      this.router.navigate(['/details', ward]);
    }
  }

  showSpinner(i: number) {
    if (this.segments[i].loading) {
      return true;
    } else {
      return false;
    }
  }

  filter(type: string, val: string): string[] {
    let options;
    if (type == 'ward') options = Object.assign([], this.wardNames);
    if (type == 'mode') options = Object.assign([], this.modeNames);

    return options.filter(name =>
      name.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  ngOnDestroy() {
    this.alive = false;
  }


}
