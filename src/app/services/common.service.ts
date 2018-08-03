import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { GoogleMapsAPIWrapper, MapsAPILoader } from '@agm/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var google:any;

@Injectable()

export class CommonService{
  constructor(private http:Http, private googleMapsApiWrapper: GoogleMapsAPIWrapper, private mapsAPILoader: MapsAPILoader){
    
  }

  loadJSON(url:string, success:Function, fail?:Function){
    this.getJSON(url).subscribe((res)=>{
      success.call(this, res);
    },(err)=>{
      (fail)?fail.call(this, err):'';
    });
  }

  getJSON(url:string):Observable<any>{
    return this.http.get(url).map((res)=>res.json()).catch(err=>err);
  }

  initAGM(ready:Function){
    /*this.googleMapsApiWrapper.getNativeMap().then(()=>{
      console.log('MAP Ready');
    });*/
    this.mapsAPILoader.load().then((res) => {
      console.log('google script loaded');
      var geocoder:any = new google.maps.Geocoder();
      ready.call(this, geocoder);
      /**
       * sample code to retrive the lat and landitude data
       */
      /*var address = "1045 mission street san francisco";
      geocoder.geocode({ 'address': address }, (results, status) => {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        console.log("lat: " + latitude + ", long: " + longitude);
      });*/
    });
  }
}