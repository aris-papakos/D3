import { Component, OnInit }        from '@angular/core';
import {FormControl}                from '@angular/forms';
import {Observable}                 from 'rxjs/Observable';
import {startWith}                  from 'rxjs/operators/startWith';
import {map}                        from 'rxjs/operators/map';


import { DataService }              from '../services/data.service'

export class Ward {
  constructor(public name: string) { }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private alive                     : boolean = true;
  wardNames                         = [];
  wardSelection                     : string;
  wardControl                       = new FormControl();
  filteredOptions                   : Observable<Ward[]>;

  constructor(private dataService: DataService) {
    dataService.wardNames$.takeWhile(() => this.alive).subscribe(wardNames=> {
      this.wardNames = wardNames;

      for (let i = 0; i < wardNames.length; i++) {
        new Ward(wardNames[i])
      }
    });
  }

  ngOnInit() {
    this.wardControl.valueChanges
      .debounceTime(1000)
      .subscribe(ward => {
        console.log(ward)
        if (this.wardNames.indexOf(ward) > -1) {
          console.log('checking: ' + ward)
          this.dataService.getCrime(ward)
            .subscribe(data => {
              console.log(data)
            });
        }
      });

    this.filteredOptions = this.wardControl.valueChanges
      .pipe(
        startWith<string | Ward>(''),
        map(value => typeof value === 'string' ? value : value),
        map(name => name ? this.filter(name) : this.wardNames.slice())
      );
  }

  filter(name: string): Ward[] {
    return this.wardNames.filter(option =>
      option.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  displayFn(ward?: Ward): string | undefined {
    return ward ? ward : undefined;
  }

  ngOnDestroy() {
    this.alive = false;
  }


}
