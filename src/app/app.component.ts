import { Component, ViewChild } from '@angular/core';
import { MdcDrawer } from '@angular-mdc/web';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('drawerRef') drawer: MdcDrawer;

  toggleDrawer(): void {
    if (this.drawer.isOpen()) {
      this.drawer.close();
    }
    else {
      this.drawer.open();
    }
  }
}
