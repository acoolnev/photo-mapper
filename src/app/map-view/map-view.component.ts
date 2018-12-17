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
import { fromEventPattern, Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MapPopupContainer } from './map-popup-container';
import { MapPopupRef } from './map-popup-ref';
import { MapApiLoader } from '../services/map-api-loader.service';
import { appendPrototype, LatLng } from '../tools/utils';

export class MapPopupConfig {
  latLng: LatLng;
}

@Component({
  selector: 'map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  private apiReady$: Observable<void>;
  private mapReady$: ReplaySubject<void>;
  @ViewChild('map_canvas') private canvas: ElementRef;
  private map: google.maps.Map;
  private markers: google.maps.Marker[] = [];

  constructor(
    private mapApiLoader: MapApiLoader,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector) {

      this.mapReady$ = new ReplaySubject(1);
  }

  addMarker(latLng: LatLng) {
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(latLng.lat, latLng.lng),
      map: this.map
    });
    this.markers.push(marker);    
  }

  removeMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  showPopup<T>(content: ComponentType<T>, config: MapPopupConfig): MapPopupRef<T> {
    let popup = new MapPopupContainer(this.map, this.renderer,
      this.componentFactoryResolver, this.appRef, this.injector);

    return popup.open<T>(content, config.latLng.lat, config.latLng.lng);
  }

  onClick(): Observable<LatLng>  {
    let mapView = this;

    let mapEvents = { clickEvent: null, dblclickEvent: null };

    return this.mapReady$.pipe(switchMap(() => fromEventPattern(
      (handler:any) => { // addHandler
        let onclickTimeout = null;

        mapEvents.clickEvent = mapView.map.addListener('click',
          function(mouseEvent) {
            onclickTimeout = setTimeout(function(){
                handler({
                  lat: mouseEvent.latLng.lat(),
                  lng: mouseEvent.latLng.lng()});
            }, 200);
          });

        // Cacncel 'click' if 'dblclick' detected.
        mapEvents.dblclickEvent = mapView.map.addListener('dblclick',
          function(mouseEvent) {
            clearTimeout(onclickTimeout);
          });
      },
      (handler:any) => { // removeHandler
        google.maps.event.removeListener(mapEvents.clickEvent);
        google.maps.event.removeListener(mapEvents.dblclickEvent);
      })));
  }

  // Should be called from initMap() since google.maps.OverlayView is only
  // defined once the Maps API has loaded.
  private injectMapsOverlay(){
    appendPrototype(google.maps.OverlayView, MapPopupContainer);
  }

  private initializeMap() {
    this.injectMapsOverlay();

    let myLatlng = {lat: 39.739252, lng: -104.989237};
    let mapOptions = {
      zoom: 8,
      center: myLatlng,
      clickableIcons: false,
      draggableCursor: 'default',
      draggingCursor: 'default',
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

    this.mapReady$.next();
  }

  // OnInit overrides
  ngOnInit() {
    this.apiReady$ = this.mapApiLoader.load();
  }

  // AfterViewInit overrides
  ngAfterViewInit() {
    this.apiReady$.subscribe(() => {
      this.initializeMap();
    });
  }
}
