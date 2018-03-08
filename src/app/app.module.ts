import { AppMaterialModule } from './app-material/app-material.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeafletComponent } from './dashboard/leaflet/leaflet.component';

import { D3Service } from 'd3-ng2-service';


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
    LeafletModule.forRoot()
  ],
  providers: [D3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
