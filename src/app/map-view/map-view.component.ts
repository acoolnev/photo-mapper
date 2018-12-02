/// <reference types="googlemaps" />
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild  } from '@angular/core';
import { Observable } from 'rxjs';
import { MapPopup } from './map-popup';
import { MapApiLoader } from '../services/map-api-loader.service';
import { appendPrototype } from '../tools/utils';


@Component({
  selector: 'map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  private apiReady$: Observable<void>;
  @ViewChild('map_canvas') private canvas: ElementRef;
  public map: google.maps.Map;

  constructor(private mapApiLoader: MapApiLoader) {}

  // Should be called from initMap() since google.maps.OverlayView is only
  // defined once the Maps API has loaded.
  injectMapsOverlay(){
    appendPrototype(google.maps.OverlayView, MapPopup);
  }

  initializeMap() {
    this.injectMapsOverlay();

    let myLatlng = {lat: 39.739252, lng: -104.989237};
    let mapOptions = {
      zoom: 8,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
      },
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
    };

    this.map = new google.maps.Map(this.canvas.nativeElement as HTMLElement, mapOptions);

     //=====Initialise Default Marker    
    // let marker = new google.maps.Marker({
    //     position: myLatlng,
    //     map: this.map,
    //     title: 'marker'
    //  //=====You can even customize the icons here
    // });
  
    //  //=====Initialise InfoWindow
    // let infowindow = new google.maps.InfoWindow({
    //   content: "<B>Civic Center Park</B>"
    // });
  
    // //=====Eventlistener for InfoWindow
    // google.maps.event.addListener(marker, 'click', function() {
    //   infowindow.open(this.map,marker);
    // });

    // this.confirmationControl = new ConfirmationControl(this.map, myLatlng);
    
    // var mapView = this;
    // var onclickTimeout = null;

    // this.map.addListener('click', function(mouseEvent){
    //     onclickTimeout = setTimeout(function(){
    //         mapView.onClick(mouseEvent);
    //     }, 200);        
    // });
    
    // this.map.addListener('dblclick', function(mouseEvent) {
    //     clearTimeout(onclickTimeout);
    // });
  }

  // OnInit overrides
  ngOnInit() {
    this.apiReady$ = this.mapApiLoader.load();
  }

  // AfterViewInit overrides
  ngAfterViewInit() {
    this.apiReady$.subscribe(() => {
      this.initializeMap();
      this.showPopup(39.739489, -104.988940);
    });
  }


  showPopup(lat: number, lng: number) {
    let popup = new MapPopup(lat, lng);
    popup.setMap(this.map);
  }
}
