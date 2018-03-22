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

  featureCollection                 = [];
  crimeList                         = {
    asbo                              : 0,
    shoplifting                       : 0,
    robbery                           : 0,
  }

  segments                          = [];
  filters                           = [];
  locationTypes                     = [
    { 'label': 'Home', 'value': 'home' },
    { 'label': 'Work', 'value': 'work' },
    { 'label': 'Leisure', 'value': 'leisure' }
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
            this.featureCollection[i] = data;
            this.dataService.setFeatures(this.featureCollection);
          });
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
