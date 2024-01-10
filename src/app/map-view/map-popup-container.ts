/* PhotoMapper

The MIT License (MIT)

Copyright (c) 2018-2024 acoolnev(https://github.com/acoolnev)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import {
   ApplicationRef,
   ComponentFactoryResolver,
   ComponentRef,
   Injector,
   Renderer2 } from '@angular/core';
import {
  ComponentType,
  ComponentPortal,
  DomPortalOutlet,
  PortalOutlet } from '@angular/cdk/portal';
import { MapPopupRef } from './map-popup-ref';


export class MapPopupContainer {
  private position: google.maps.LatLng;
  private body: HTMLElement;
  private portal: ComponentPortal<any>;
  private outlet: PortalOutlet;

  constructor(
    private map: google.maps.Map,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector) {

    this.body = this.createPopup(this.renderer);

    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation();
  }

  open<T>(content: ComponentType<T>, lat: number, lng: number) : MapPopupRef<T> {
    this.close();

    const contentRef = this.attachContent<T>(content);
    this.position = new google.maps.LatLng(lat, lng);
    this.setMap(this.map);

    return new MapPopupRef<T>(contentRef.instance, this);
  }

  close() {
    this.detachContent();

    if (this.body && this.renderer.parentNode(this.body)) {
      this.renderer.removeChild(this.renderer.parentNode(this.body), this.body);
    }
  }

  private attachContent<T>(content: ComponentType<T>) : ComponentRef<T> {
    this.portal = new ComponentPortal(content);

    this.outlet = new DomPortalOutlet(this.body,
      this.componentFactoryResolver, this.appRef, this.injector);

    return this.outlet.attach(this.portal);
  }

  private detachContent() {
    if (this.portal && this.portal.isAttached) {
      this.portal.detach();
    }

    if (this.outlet) {
      this.outlet.dispose();
    }
  }

  private createPopup(renderer: Renderer2): HTMLElement {
    let arrow = renderer.createElement('div');
    renderer.addClass(arrow, 'arrow');

    let body = renderer.createElement('div');
    renderer.addClass(body, 'map-popup');
    renderer.addClass(body, 'active');
    renderer.appendChild(body, arrow);

    return  body;
  }

  private stopEventPropagation() {
    this.body.style.cursor = 'default';

    let body = this.body;

    ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
     'pointerdown']
        .forEach(function(event) {
          body.addEventListener(event, function(e) {
            e.stopPropagation();
          });
        });
  }

  // Called when the popup is added to the map.
  onAdd() {
    this.getPanes().floatPane.appendChild(this.body);
  }

  // Called when the popup is removed from the map.
  onRemove() {
    this.close();
  }

  // Called when the popup needs to draw itself.
  draw() {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
    // Hide the popup when it is far out of view.
    var display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none';

    if (display === 'block') {
      this.body.style.left = (divPosition.x - this.body.offsetWidth/2)+ 'px';
      this.body.style.top = (divPosition.y - this.body.offsetHeight - 13) + 'px';
    }
    if (this.body.style.display !== display) {
      this.body.style.display = display;
    }
  }

  // Declare stubs that is overridden by google.maps.OverlayView
  getPanes() : any {}
  getProjection() : any {}
  setMap(map: google.maps.Map) {}
}
