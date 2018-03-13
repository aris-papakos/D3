import { Injectable }               from '@angular/core';
import { Http, Response,
  Headers, RequestOptions }         from '@angular/http';
import {Observable}                 from 'rxjs/Rx';
import { Subject }                  from 'rxjs/Subject';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class DataService {

  private wardNames = new Subject<any>();
  wardNames$ = this.wardNames.asObservable();

  constructor(private http: Http) { }

  getWards(): Observable<any> {
    return this.http.get('http://localhost:3000/api/ward/get')
    .map((res:any) => res.json())
    .catch((error:any) => {
      return Observable.throw(error);
    });
  }

  getCrime(ward: any): Observable<any> {
    console.log(ward)
    return this.http.get('http://localhost:3000/api/crime/get', {
      params: { ward: ward }
    })
    .map((res:any) => res.json())
    .catch((error:any) => {
      return Observable.throw(error);
    });
  }

  // NAMES
  setWardNames(names) {
    this.wardNames.next(names);
  }

  getWardNames() {
    return this.wardNames
  }

}
