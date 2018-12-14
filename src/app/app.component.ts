import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ConfirmPhotoLocationComponent } from './widgets/confirm-photo-location.component';
import { MapPopupRef } from './map-view/map-popup-ref';
import { LatLng, MapViewComponent } from './map-view/map-view.component';
import { FileIo } from './services/file-io.service';
import { addGpsInfo, hasGpsInfo } from './tools/utils'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('map_view') private mapView: MapViewComponent;
  private mapPopup: MapPopupRef<ConfirmPhotoLocationComponent>;
  images = new Array<{id: number, file: File, hasGpsInfo: boolean, dataUrl: string}>();
  currentImage: number = 0;

  constructor(private fileIo: FileIo) {}

  public onSelectedFiles(event: Event) {
    this.images.length = 0; // Clear images
    this.currentImage = 0;
    let files: FileList = (event.target as HTMLInputElement).files;
    for (let i = 0; i < files.length; ++i) {
      let file = files[i];
      this.fileIo.load(file).subscribe(dataUrl => {
        let img = {id: i, file: file, hasGpsInfo: hasGpsInfo(dataUrl),
                   dataUrl: dataUrl };
        this.images[i] = img;
      });
    }
  }

  // AfterViewInit overrides
  ngAfterViewInit() {
    
    this.mapView.onClick().subscribe((latLng: LatLng) => {
      if (this.mapPopup) {
        this.mapPopup.close();
      }
      this.mapPopup = this.mapView.showPopup(ConfirmPhotoLocationComponent,
         { latLng: latLng });

      this.mapPopup.componentInstance.cancel.subscribe(() => {
        this.mapPopup.close();
        this.mapPopup = null;
      });

      this.mapPopup.componentInstance.confirm.subscribe(() => {
        if (this.images.length) {
          const jpegDataUrl = this.images[this.currentImage].dataUrl;
          addGpsInfo(jpegDataUrl, latLng.lat, latLng.lng);        
        }

        this.mapPopup.close();
        this.mapPopup = null;
      });
    });
  }
}
