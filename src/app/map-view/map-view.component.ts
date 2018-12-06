/// <reference types="googlemaps" />
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { MapPopupContainer } from './map-popup-container';
import { MapPopupContent } from './map-popup-content';
import { MapApiLoader } from '../services/map-api-loader.service';
import { appendPrototype } from '../tools/utils';

export class MapPopupConfig {
  lat: number;
  lng: number;
}

@Component({
  selector: 'map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  private apiReady$: Observable<void>;
  @ViewChild('map_canvas') private canvas: ElementRef;
  public map: google.maps.Map;

  constructor(
    private mapApiLoader: MapApiLoader,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector) {}

  // Should be called from initMap() since google.maps.OverlayView is only
  // defined once the Maps API has loaded.
  injectMapsOverlay(){
    appendPrototype(google.maps.OverlayView, MapPopupContainer);
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
      this.showPopup(MapPopupContent, { lat: 39.739489, lng: -104.988940, });
    });
  }

  showPopup<T>(content: ComponentType<T>, config: MapPopupConfig) {
    let popup = new MapPopupContainer(this.map, this.renderer,
      this.componentFactoryResolver, this.appRef, this.injector);

    popup.open(content, config.lat, config.lng);
  }
}
