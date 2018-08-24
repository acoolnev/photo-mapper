import { NgModule } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MapViewComponent } from './map-view/map-view.component';
import { environment } from '../environments/environment'
import { MAP_API_KEY_TOKEN } from './services/config'
import { MapApiLoader } from './services/map-api-loader.service';
import { RunOnce } from './services/run-once.service';
import { ScriptLoader } from './services/script-loader.service';

@NgModule({
  declarations: [
    AppComponent,
    MapViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatSidenavModule,
  ],
  providers: [
    MapApiLoader,
    RunOnce,
    ScriptLoader,
    { provide: MAP_API_KEY_TOKEN, useValue: environment.mapApiKey }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
