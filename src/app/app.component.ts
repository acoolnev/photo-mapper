import { Component } from '@angular/core';
import { MapApiLoader } from './services/map-api-loader.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private mapApiLoader: MapApiLoader) {
    this.mapApiLoader.load().subscribe(() => {
      console.log("called initMapApi");
    });
  }
}
