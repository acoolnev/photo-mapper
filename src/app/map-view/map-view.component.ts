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

export class MapMarker {
  constructor(
    private marker: google.maps.Marker,
    private mapView: MapViewComponent) {}

  makeVisible() {
    const latLng = this.fromMapLatLng(this.marker.getPosition());
    if (!this.mapView.isVisible(latLng))
      this.mapView.setCenter(latLng);
  }

  move(newLatLng: LatLng, makeVisible = true) {
    this.marker.setPosition(this.toMapLatLng(newLatLng));
    
    if (makeVisible)
    this.makeVisible();
  }

  remove() {
    this.marker.setMap(null);
  }

  private fromMapLatLng(mapLatLng: google.maps.LatLng) : LatLng {
    return { lat: mapLatLng.lat(), lng: mapLatLng.lng() };
  }

  private toMapLatLng(latLng: LatLng) : google.maps.LatLng {
    return new google.maps.LatLng(latLng.lat, latLng.lng);
  }
}

@Component({
  selector: 'map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  private apiReady$: Observable<void>;
  private mapReady$: ReplaySubject<void>;
  @ViewChild('map_canvas', { static: true }) private canvas: ElementRef;
  private map: google.maps.Map;

  constructor(
    private mapApiLoader: MapApiLoader,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector) {

      this.mapReady$ = new ReplaySubject(1);
  }

  isVisible(latLng: LatLng) : boolean {
    const bounds = this.map.getBounds();
    return bounds.contains(this.toMapLatLng(latLng));
  }

  setCenter(latLng: LatLng) {
    this.map.setCenter(this.toMapLatLng(latLng));
  }

  addMarker(latLng: LatLng, makeVisible = true) : MapMarker {
    const mapMarker = new google.maps.Marker({
      position: new google.maps.LatLng(latLng.lat, latLng.lng),
      map: this.map
    });

    const marker = new MapMarker(mapMarker, this);
    if (makeVisible)
      marker.makeVisible();

    return marker;
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
            }, 260);
          });

        // Cancel 'click' if 'dblclick' detected.
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

    let myLatlng = {lat: 0.0, lng: 0.0};
    let mapOptions = {
      zoom: 2,
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

  private toMapLatLng(latLng: LatLng) : google.maps.LatLng {
    return new google.maps.LatLng(latLng.lat, latLng.lng);
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
