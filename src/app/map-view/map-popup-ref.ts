import { MapPopupContainer } from './map-popup-container'

export class MapPopupRef<T> {
  constructor(
    public componentInstance: T,
    private container: MapPopupContainer) {}

  close() {
    this.container.close();
  }
}
