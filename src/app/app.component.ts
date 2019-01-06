import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material';
import { BadFileListComponent } from './widgets/bad-file-list.component';
import { ConfirmPhotoLocationComponent } from './widgets/confirm-photo-location.component';
import { MapPopupRef } from './map-view/map-popup-ref';
import { MapMarker, MapViewComponent } from './map-view/map-view.component';
import { FileIo } from './services/file-io.service';
import { addGpsInfo, getGpsInfo, LatLng } from './tools/utils'

class ImageInfo {
  id: number;
  fileName: string;
  latLng: LatLng;
  dataUrl: string;
  saved: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('map_view') private mapView: MapViewComponent;
  private mapPopup: MapPopupRef<ConfirmPhotoLocationComponent>;
  private imageMarker: MapMarker;
  images: ImageInfo[] = [];
  currentImage: number = 0;
  showHelp: boolean = false;

  constructor(private fileIo: FileIo, private snackBar: MatSnackBar) {}

  public onFilesSelected(event: Event) {
    let files: FileList = (event.target as HTMLInputElement).files;
    if (!files.length) // Cancel pressed in the files dialog
      return;

    this.clearMapState();
    this.images = []; // Clear images
    this.currentImage = 0;
    let imageId = 0;
    let badFilesSnackBarRef: MatSnackBarRef<BadFileListComponent> = null;

    for (let i = 0; i < files.length; ++i) {
      let file = files[i];
      this.fileIo.load(file).subscribe({
        next: (dataUrl) => {
          let image = {id: imageId, fileName: file.name, latLng: getGpsInfo(dataUrl),
                    dataUrl: dataUrl, saved: false};
          this.images.push(image);

          if (imageId == this.currentImage)
            this.setMarker(image);

          ++imageId;
        },
        error: (err) => {
          if (!badFilesSnackBarRef) {
            badFilesSnackBarRef = this.snackBar.openFromComponent(BadFileListComponent, {
              duration: 20000
            });

            badFilesSnackBarRef.instance.close.subscribe(() => {
              badFilesSnackBarRef.dismiss();
            });
          }

          badFilesSnackBarRef.instance.fileNames.push(file.name);
        }
      });
    }
  }

  public onImageClick(image: ImageInfo) {
    this.clearMapState();

    if (!image)
      return;

    this.currentImage = image.id;
    this.setMarker(image);
  }

  private clearMapState() {
    if (this.mapPopup) {
      this.mapPopup.close();
    }

    if (this.imageMarker) {
      this.imageMarker.remove();
      this.imageMarker = null;
    }
  }

  private setMarker(image: ImageInfo) {
    if (image && image.latLng) {
      if (this.imageMarker) {
        this.imageMarker.move(image.latLng);
      }
      else {
        this.imageMarker = this.mapView.addMarker(image.latLng);
      }
    }
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

        let image = this.images[this.currentImage];
        const jpegDataUrl = image.dataUrl;
        const newJpegData = addGpsInfo(jpegDataUrl, latLng.lat, latLng.lng);
        image.latLng = latLng;
        image.saved = true;
        this.setMarker(image);

        this.fileIo.save(newJpegData, image.fileName);
      });
    });
  }
}
