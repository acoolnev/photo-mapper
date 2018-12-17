import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmPhotoLocationComponent } from './widgets/confirm-photo-location.component';
import { MapPopupRef } from './map-view/map-popup-ref';
import { MapViewComponent } from './map-view/map-view.component';
import { FileIo } from './services/file-io.service';
import { addGpsInfo, getGpsInfo, LatLng } from './tools/utils'

class ImageInfo {
  id: number;
  file: File;
  latLng: LatLng;
  dataUrl: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('selectFiles') private selectFiles: ElementRef;
  @ViewChild('map_view') private mapView: MapViewComponent;
  private mapPopup: MapPopupRef<ConfirmPhotoLocationComponent>;
  images: ImageInfo[] = [];
  currentImage: number = 0;

  constructor(private fileIo: FileIo) {}

  public onSelectFilesClick() {
    this.clearMapState();

    (this.selectFiles.nativeElement as HTMLInputElement).click();
  }
  
  public onFilesSelected(event: Event) {
    this.images.length = 0; // Clear images
    this.currentImage = 0;
    let files: FileList = (event.target as HTMLInputElement).files;
    for (let i = 0; i < files.length; ++i) {
      let file = files[i];
      this.fileIo.load(file).subscribe(dataUrl => {
        let img = {id: i, file: file, latLng: getGpsInfo(dataUrl),
                   dataUrl: dataUrl };
        this.images[i] = img;

        if (i == this.currentImage && img.latLng)
          this.mapView.addMarker(this.images[this.currentImage].latLng);
      });
    }
  }

  public onImageClick(image: ImageInfo) {
    this.clearMapState();

    if (!image)
      return;

    this.currentImage = image.id;
    if (image.latLng)
      this.mapView.addMarker(image.latLng);
  }

  private clearMapState() {
    if (this.mapPopup) {
      this.mapPopup.close();
    }
    this.mapView.removeMarkers();
  }

  // AfterViewInit overrides
  ngAfterViewInit() {
    
    this.mapView.onClick().subscribe((latLng: LatLng) => {
      if (this.mapPopup) {
        this.mapPopup.close();
      }

      if (!this.images.length) {
        return;
      }

      this.mapPopup = this.mapView.showPopup(ConfirmPhotoLocationComponent,
         { latLng: latLng });

      this.mapPopup.componentInstance.cancel.subscribe(() => {
        this.mapPopup.close();
        this.mapPopup = null;
      });

      this.mapPopup.componentInstance.confirm.subscribe(() => {
        this.mapPopup.close();
        this.mapPopup = null;

        const jpegDataUrl = this.images[this.currentImage].dataUrl;
        const newJpegData = addGpsInfo(jpegDataUrl, latLng.lat, latLng.lng);
        const file = this.images[this.currentImage].file;
        this.fileIo.save(newJpegData, file);
      });
    });
  }
}
