/* PhotoMapper

The MIT License (MIT)

Copyright (c) 2018-2024 acoolnev(https://github.com/acoolnev)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { NgModule } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
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
