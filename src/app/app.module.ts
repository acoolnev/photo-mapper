import { NgModule } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { BadFileListComponent } from './widgets/bad-file-list.component';
import { CloseButtonComponent } from './widgets/close-button.component';
import { ConfirmPhotoLocationComponent } from './widgets/confirm-photo-location.component';
import { MapViewComponent } from './map-view/map-view.component';
import { environment } from '../environments/environment'
import { MAP_API_KEY_TOKEN } from './services/config'
import { FileIo } from './services/file-io.service';
import { MapApiLoader } from './services/map-api-loader.service';
import { RunOnce } from './services/run-once.service';
import { ScriptLoader } from './services/script-loader.service';

@NgModule({
  declarations: [
    AppComponent,
    BadFileListComponent,
    CloseButtonComponent,
    ConfirmPhotoLocationComponent,
    MapViewComponent
  ],
  entryComponents: [
    BadFileListComponent,
    ConfirmPhotoLocationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  providers: [
    FileIo,
    MapApiLoader,
    RunOnce,
    ScriptLoader,
    { provide: MAP_API_KEY_TOKEN, useValue: environment.mapApiKey }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
