import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  images = Array.from(Array(4), (x, i) => i);
  currentImage: number = undefined;
}
