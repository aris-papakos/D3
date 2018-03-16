import { Component, OnInit }        from '@angular/core';
import { FormControl }              from '@angular/forms';
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

  selectHome                        = new FormControl();
  filteredHome                      : Observable<string[]>;
  wardHome                          : string;

  selectWork                        = new FormControl();
  filteredWork                      : Observable<string[]>;
  wardWork                          : string;

  selectTravel                      = new FormControl();
  filteredTravel                    : Observable<string[]>;
  modeTravel                        : string;

  featureCollection                 = {};


  constructor(private dataService: DataService) {
    dataService.wardNames$.takeWhile(() => this.alive).subscribe(wardNames=> {

      for (let i = 0; i < wardNames.length; i++) {
        this.wardNames.push(wardNames[i])
      }
    });
  }

  ngOnInit() {
    this.selectHome.valueChanges
      .debounceTime(1000)
      .subscribe(home => {
        if (this.wardNames.indexOf(home) > -1) {
          this.wardHome = home
          this.dataService.getCrime(home)
            .subscribe(data => {
              this.featureCollection['home'] = data;
              this.dataService.setFeatures(this.featureCollection);
            });

          if (this.modeNames.indexOf(this.modeTravel) > -1 && this.wardNames.indexOf(this.wardWork) > -1) {
            this.dataService.getRoute(this.modeTravel, this.wardHome, this.wardWork)
              .subscribe(data => {
                this.featureCollection['travel'] = data;
                this.dataService.setFeatures(this.featureCollection);
              });
          }
        }
      });

    this.filteredHome = this.selectHome.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter('ward', val))
      );

    this.selectWork.valueChanges
      .debounceTime(1000)
      .subscribe(work => {
        if (this.wardNames.indexOf(work) > -1) {
          this.wardWork = work
          this.dataService.getCrime(work)
            .subscribe(data => {
              this.featureCollection['work'] = data;
              this.dataService.setFeatures(this.featureCollection);
            });

            if (this.modeNames.indexOf(this.modeTravel) > -1 && this.wardNames.indexOf(this.wardHome) > -1) {
              this.dataService.getRoute(this.modeTravel, this.wardHome, this.wardWork)
                .subscribe(data => {
                  this.featureCollection['travel'] = data;
                  this.dataService.setFeatures(this.featureCollection);
                });
            }
        }
      });

    this.filteredWork = this.selectWork.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter('ward', val))
      );

    this.selectTravel.valueChanges
      .debounceTime(1000)
      .subscribe(mode => {
        if (this.modeNames.indexOf(mode) > -1) {
          this.modeTravel = mode
          this.dataService.getRoute(mode, this.wardHome, this.wardWork)
            .subscribe(data => {
              this.featureCollection['travel'] = data;
              this.dataService.setFeatures(this.featureCollection);
            });
        }
      });

    this.filteredTravel = this.selectTravel.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter('mode', val))
      );
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
