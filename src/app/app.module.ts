import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MdcDrawerModule } from '@angular-mdc/web';

import { AppComponent } from './app.component';
import { RunOnce } from './services/run-once.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MdcDrawerModule
  ],
  providers: [
    RunOnce
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
