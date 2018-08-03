import { Component } from '@angular/core';
import { MouseEvent } from '@agm/core';
import { CommonService } from './services/common.service';
import { GoogleMapsAPIWrapper, MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  /**
   * To save status of loading of page
   */
  loading:boolean = true;
  /**
   * Tosave status of loading of map
   */
  mapLoading:boolean = true;
  /**
   * url to fetch the data "https://api.myjson.com/bins/197i9r"
   */
  //URL: string = "https://api.myjson.com/bins/197i9r";
  /**
   * url to fetch the large data "https://api.myjson.com/bins/znyzj"
   */
  URL: string = "https://api.myjson.com/bins/znyzj";
  /**
   * To store status of Json Load
   */
  isJSONReady: boolean = false;
  /**
   * To store status of geocode API Load
   */
  isGeocoderReady: boolean = false;
  /**
   * To store data from loaded json
   */
  dataList: any = null;
  /**
   * To store geocode object
   */
  geocoder: any = null;
  /**
   * To store marking points in map
   */
  markersClone: marker[] = [];
  /**
   * To store marking points in map
   */
  markers: marker[] = [];
  /**
   * To store marker obj of map
   */
  marker:any = null;
  /**
   * month name to shorthand
   */
  monthNames: any = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  /**
   * To store the status of markes Array created
   */
  markersDone:boolean = false;

  constructor(private commonService: CommonService, private mapsAPILoader:MapsAPILoader) { }
  /**
   * Represents the first lifecycle hook in the component
   */
  ngOnInit() {
    this.commonService.initAGM((geocoder) => {
      this.geocoderReady(geocoder);
    });

    //this.commonService.loadJSON(this.URL+'error', (res) => {
    this.commonService.loadJSON(this.URL, (res) => {
      this.jsonDataReady(res);
    }, (err) => {
      console.error(err, 'Got error on loading json from API, So JSON loaded from local path');
      this.commonService.loadJSON('./assets/data/local-data.json', (res) => {
        this.jsonDataReady(res);
      });
    });
  }
  ngAfterViewInit(){
    setTimeout(() => {
      this.markers = this.markersClone;
      this.mapLoading = false;
    }, 3000);
  }
  /**
   * Represents the geocode ready Function
   * @param {object} res
   */
  geocoderReady(res: any) {
    this.isJSONReady = true;
    this.geocoder = res;
    this.allDataReady();
  }
  /**
   * Represents the json data ready Function
   * @param {object} res
   */
  jsonDataReady(res: any) {
    this.isGeocoderReady = true;
    this.dataList = res;
    this.dataList.map((elm)=>{
      elm['hilight'] = false;
    })
    this.allDataReady();
  }
  /**
   * Represents the checking of all data load and drive the markers and adress
   */
  allDataReady() {
    if (this.isJSONReady && this.isGeocoderReady) {
      this.makeMarkersFromLoadedJSONData(this.dataList, this.geocoder);
      this.loading = false;
    }
  }
  /**
   * Represents the making of markers from json data
   * @param {object} data
   * @param {any} geo
   */
  makeMarkersFromLoadedJSONData(data: any, geo: any) {
    data.map((elm, index) => {
      var address: any = elm.Property.Address;
      //console.log(address);
      var addressLine: string = address.StreetNumber + ' ' + address.StreetName + ' ' + address.City;
      //console.log(addressLine);
      this.formMarkerArray(addressLine, geo, ++index);
    })
  }
  /**
   * Represents the making of markersArray from json data and geo object
   * @param {string} _addressLine
   * @param {any} geo
   * @param {number} _index
   */
  formMarkerArray(_addressLine: string, geo: any, _index:number) {
    let addressLine = _addressLine;
    let index = String(_index);
    geo.geocode({ 'address': addressLine }, (results, status) => {
      let latitude = results[0].geometry.location.lat();
      let longitude = results[0].geometry.location.lng();
      //console.log("addressLine: " + addressLine + " lat: " + latitude + ", long: " + longitude);
      let markerObj: any = {
        lat: latitude,
        lng: longitude,
        label: index,
        draggable: false,
        info: addressLine,
        hilight: false,
        opacity: 0.5,
        zIndex: 0
      };
      this.markersClone[Number(index)-1] = markerObj;
      /*if(this.markersClone.length === this.dataList.length){
        this.markers = this.markersClone;
        this.mapLoading = false;
      }*/
    });
  }
  /**
   * Represents the spliting of amount with comma
   * @param {string} amount
   */
  splitAmountWithComma(amount: string) {
    var newAmount: string = '';
    var detectCommaPlace: number = 0;
    for (var i = amount.length - 1; i >= 0; i--) {
      if (detectCommaPlace !== 0 && detectCommaPlace % 3 === 0) {
        newAmount = amount.charAt(i) + ',' + newAmount;
      } else {
        newAmount = amount.charAt(i) + newAmount;
      }
      detectCommaPlace++;
    }
    newAmount = newAmount + '.00';
    return newAmount;
  }
  /**
   * Represents the convertion of doller
   * @param {string} amount
   * @param {string} mode
   */
  convertDoller(amount, mode) {
    var displayAmount: string = '$ ' + String(this.splitAmountWithComma
      (String(amount)));
    (mode == 'Rent') ? displayAmount = displayAmount + ' per month' : '';
    return displayAmount;
  }
  /**
   * Represents the convertion of time to AM and PM
   * @param {string} time
   */
  tConvert(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) { // If time format correct
      time = time.slice(1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    } else {
      time[0] = time[0] + ' AM';
    }
    return time.join(''); // return adjusted time or original string
  }
  /**
   * Represents the hilight of position in map
   * @param {number} i
   */
  hilightOnMap(i: number) {
    this.markers.map((elm, index) => {
      elm.opacity = 0.5;
      elm.zIndex = 0;
      elm.hilight = false;
      if(index === i){
        this.dataList[index].hilight = true;
      }else{
        this.dataList[index].hilight = false;
      }
      
    });
    this.markers[i].opacity = 1;
    this.markers[i].zIndex = 100;
    this.markers[i].hilight = true;
  }
  /**
   * Represents grab of Highest date
   * @param {any} getDateList
   */
  getLatestDat(getDateList: any) {
    var greatestDat = 0;
    var greatestDatIndex = 0;
    var date = null;
    var day = '';
    var month = '';
    var startTime = '';
    var endTime = '';

    for (var i = 0; i < getDateList.length; i++) {
      var parts = String(getDateList[i].Date).split('/');
      if (String(parts[1]).length === 1) {
        parts[1] = String('0' + parts[1]);
      }
      if (String(parts[0]).length === 1) {
        parts[0] = String('0' + parts[0]);
      }
      var dateNum = Number(parts[2] + parts[1] + parts[0]);
      if (greatestDat < dateNum) {
        greatestDat = dateNum;
        greatestDatIndex = i;
        date = new Date(String(parts[2]) + '/' + parts[1] + '/' + parts[0]);
        startTime = getDateList[i].StartTime;
        endTime = getDateList[i].EndTime;
      }
    }
    return this.monthNames[date.getMonth()] + '. ' + date.getDate() + ' - ' + this.tConvert(startTime) + ' to ' + this.tConvert(endTime);

  }

  //Maps

  // google maps zoom level
  zoom: number = 13;

  //NewYork Location
  lat: number = 40.770
  lng: number = -73.97

  clickedMarker(m:any, label: string, index: number) {
    var arrayIndex = Number(index);
    var elm = document.getElementById(String(index+1));
    elm.scrollIntoView();
    this.markers.map((elm, index)=>{
      if(arrayIndex === index){
        elm.opacity = 1;
        elm.hilight = true;
        this.dataList[index].hilight = true;
      }else{
        elm.opacity = 0.5;
        elm.hilight = false;
        this.dataList[index].hilight = false;
      }
    });
  }

}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  draggable: boolean;
  info: string;
  hilight: boolean;
  label?: string;
  icon?: string;
  opacity?: number;
  zIndex?: any;
}
