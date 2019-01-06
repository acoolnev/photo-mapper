import { Component } from '@angular/core';

@Component({
  selector: 'close-button',
  templateUrl: './close-button.component.html',
  styleUrls: ['./close-button.component.scss'],
  host: {
    'class': 'close-button'
  }
})
export class CloseButtonComponent {}
