import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';


import { AppComponent } from './app.component';

import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';

import { CommonService } from './services/common.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AgmCoreModule.forRoot({
      // please get your own API key here:
      // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
      apiKey: 'AIzaSyAZArt8I2GEg3fKM0CyKLPOONfEyWWSqsA'
    }),
  ],
  providers: [ CommonService, GoogleMapsAPIWrapper ],
  bootstrap: [AppComponent]
})
export class AppModule { }
