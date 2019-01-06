import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'bad-file-list',
  templateUrl: './bad-file-list.component.html',
  styleUrls: ['./bad-file-list.component.scss']
})
export class BadFileListComponent {
  @Output() close: EventEmitter<any> = new EventEmitter();
  public fileNames: string[] = [];

  closeList() {
    this.close.emit();
  }
}
