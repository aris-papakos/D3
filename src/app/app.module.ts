import { NgModule }                 from '@angular/core';
import { BrowserModule }            from '@angular/platform-browser';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';
import { FlexLayoutModule }         from "@angular/flex-layout";
import { FormsModule,
  ReactiveFormsModule }             from '@angular/forms';
import { HttpModule }               from '@angular/http';

import { AppMaterialModule }        from './app-material/app-material.module';
import { AppRoutingModule }         from './app-routing/app-routing.module';
import { LeafletModule }            from '@asymmetrik/ngx-leaflet';

import { AppComponent }             from './app.component';
import { DashboardComponent }       from './dashboard/dashboard.component';
import { LeafletComponent }         from './dashboard/leaflet/leaflet.component';

import { D3Service }                from 'd3-ng2-service';
import { DataService }              from './services/data.service'

@NgModule({
  declarations: [
    AppComponent,
    LeafletComponent,
    DashboardComponent,
  ],
  imports: [
    AppMaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    FlexLayoutModule,
    FormsModule,
    LeafletModule.forRoot(),
    ReactiveFormsModule
  ],
  providers: [
    D3Service,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
