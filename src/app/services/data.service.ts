import { Injectable }               from '@angular/core';
import { Http, Response,
  Headers, RequestOptions }         from '@angular/http';
import { Observable }               from 'rxjs/Rx';
import { Subject }                  from 'rxjs/Subject';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class DataService {

  private wardNames = new Subject<any>();
  private features = new Subject<any>();
  wardNames$ = this.wardNames.asObservable();
  features$ = this.features.asObservable();

  featuresRaw = {}

  constructor(private http: Http) { }

  getWards(): Observable<any> {
    return this.http.get('http://localhost:3000/api/ward/get')
    .map((res:any) => res.json())
    .catch((error:any) => {
      return Observable.throw(error);
    });
  }

  getCrime(ward: any, sample: boolean): Observable<any> {
    return this.http.get('http://localhost:3000/api/crime/getWard', {
      params: { ward: ward, sample: sample }
    })
    .map((res:any) => res.json())
    .catch((error:any) => {
      return Observable.throw(error);
    });
  }

  getRoute(mode: string, start: any, end: any): Observable<any> {
    return this.http.get('http://localhost:3000/api/crime/getRoute', {
      params: { mode: mode, start: start, end: end }
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
    return this.wardNames$;
  }

  // FEATURES
  setFeatures(features) {
    this.features.next(features);
    this.featuresRaw = features;
  }

  getFeatures() {
    return this.features$;
  }

}
