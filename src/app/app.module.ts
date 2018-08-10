import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MdcDrawerModule } from '@angular-mdc/web';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment'
import { MAP_API_KEY_TOKEN } from './services/config'
import { MapApiLoader } from './services/map-api-loader.service';
import { RunOnce } from './services/run-once.service';
import { ScriptLoader } from './services/script-loader.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MdcDrawerModule
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
