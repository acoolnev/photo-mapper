import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSidenav, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { BadFileListComponent } from './widgets/bad-file-list.component';
import { ConfirmPhotoLocationComponent } from './widgets/confirm-photo-location.component';
import { MapPopupRef } from './map-view/map-popup-ref';
import { MapMarker, MapViewComponent } from './map-view/map-view.component';
import { FileIo } from './services/file-io.service';
import {
   addGpsInfo, Cancelation, getGpsInfo, LatLng,
   loadExifObject, storeExifObject } from './tools/utils'

class ImageInfo {
  id: number;
  fileName: string;
  exifObject: object;
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
  @ViewChild('selectFiles', { static: true }) private selectFiles: ElementRef;
  @ViewChild('sidenav', { static: true }) private sidenav: MatSidenav;
  @ViewChild('map_view', { static: true }) private mapView: MapViewComponent;
  private mapPopup: MapPopupRef<ConfirmPhotoLocationComponent>;
  private imageMarker: MapMarker;
  private cancelFileLoad: Cancelation = new Cancelation;
  images: ImageInfo[] = [];
  currentImage: number = 0;
  fileLoadProgressValue: number = 100;
  showHelp: boolean = false;

  constructor(private fileIo: FileIo, private snackBar: MatSnackBar) {}

  public onLoadFilesClick(event: Event) {
    try {
      this.selectFiles.nativeElement.click();
    }
    catch(err) {
      if (err instanceof Error) {
        let badFilesSnackBarRef = this.snackBar.openFromComponent(BadFileListComponent, {
          duration: 10000
        });

        badFilesSnackBarRef.instance.close.subscribe(() => {
          badFilesSnackBarRef.dismiss();
        });

        badFilesSnackBarRef.instance.fileNames.push(err.message);
      }
      else {
        throw err;
      }
    }
  }

  public onFilesSelected(event: Event) {
    let files: FileList = (event.target as HTMLInputElement).files;
    if (!files.length) // Cancel pressed in the files dialog
      return;

    this.clearMapState();
  
    // Cancel former files loading if it is still in progress.
    this.cancelFileLoad.cancel = true;
    this.cancelFileLoad = new Cancelation;
    let cancelation = this.cancelFileLoad;

    this.images = []; // Clear images
    this.currentImage = 0;
    let imageId = 0;
    let currentFileIndex = 0;
    let badFilesSnackBarRef: MatSnackBarRef<BadFileListComponent> = null;
  
    let  fileHandler = {
      next: (dataUrl) => {
        if (cancelation.cancel) {
          files = null;
          return;
        }

        this.fileLoadProgressValue = Math.floor(
          ((currentFileIndex + 1) * 100 / files.length) + 0.5);

        let file = files[currentFileIndex];

        let exifObject = loadExifObject(dataUrl);
        
        let image = {id: imageId, fileName: file.name, exifObject: exifObject,
                     latLng: getGpsInfo(exifObject), dataUrl: dataUrl,
                     saved: false};
        this.images.push(image);

        if (imageId == this.currentImage)
          this.setMarker(image);

        ++imageId;

        // Load next file.
        if (++currentFileIndex < files.length)
          this.fileIo.load(files[currentFileIndex]).subscribe(fileHandler);
      },
      error: (err) => {
        if (cancelation.cancel) {
          files = null;
          return;
        }

        this.fileLoadProgressValue = Math.floor(
          ((currentFileIndex + 1) * 100 / files.length) + 0.5);

        let file = files[currentFileIndex];

        if (!badFilesSnackBarRef) {
          badFilesSnackBarRef = this.snackBar.openFromComponent(BadFileListComponent, {
            duration: 20000
          });

          badFilesSnackBarRef.instance.close.subscribe(() => {
            badFilesSnackBarRef.dismiss();
          });
        }

        badFilesSnackBarRef.instance.fileNames.push(file.name);

        // Load next file.
        if (++currentFileIndex < files.length)
          this.fileIo.load(files[currentFileIndex]).subscribe(fileHandler);
      }
    };

    // Load files asynchronously one by one.
    this.fileIo.load(files[currentFileIndex]).subscribe(fileHandler);
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

    setTimeout(() => {
      this.sidenav.open();
    });
    
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
        addGpsInfo(image.exifObject, latLng);
        const newJpegData = storeExifObject(image.exifObject, image.dataUrl);
        image.latLng = latLng;
        image.saved = true;
        this.setMarker(image);

        this.fileIo.save(newJpegData, image.fileName);
      });
    });
  }
}
