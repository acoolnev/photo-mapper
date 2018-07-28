import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MdcDrawerModule } from '@angular-mdc/web';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MdcDrawerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
