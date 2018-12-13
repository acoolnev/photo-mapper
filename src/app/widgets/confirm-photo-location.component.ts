import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'confirm-photo-location',
  templateUrl: './confirm-photo-location.component.html',
  styleUrls: ['./confirm-photo-location.component.scss']
})
export class ConfirmPhotoLocationComponent {
  @Output() confirm: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();

  confirmLocation() {
    this.confirm.emit();
  }

  cancelLocation() {
    this.cancel.emit();
  }
}
