import { Component } from '@angular/core';
import { FileIo } from './services/file-io.service';
import { hasGpsInfo } from './tools/utils'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
}
