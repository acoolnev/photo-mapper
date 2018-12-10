import { MapPopupContainer } from './map-popup-container'

export class MapPopupRef
{
  constructor(private container: MapPopupContainer) {}

  close() {
    this.container.close();
  }
}
