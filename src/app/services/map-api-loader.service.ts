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

import { Injectable, Inject, OnDestroy, NgZone } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { MAP_API_KEY_TOKEN } from './config';
import { RunOnce } from './run-once.service';
import { ScriptLoader } from './script-loader.service';

declare var window: any;

@Injectable()
export class MapApiLoader implements OnDestroy {
  api$: ReplaySubject<any> = new ReplaySubject(1);

  constructor(private zone: NgZone, private runOnce: RunOnce,
     private scriptLoader: ScriptLoader,
    @Inject(MAP_API_KEY_TOKEN) private mapApiKey: string) {}

  load(): Observable<void> {
    this.runOnce.run("load-map-api", () => {

      window['initMapApi'] = () => {
        this.zone.run(() => { this.api$.next(true); });
      };

      this.scriptLoader.load(this.formatApiUrl()).subscribe(
        null,
        err => {
          this.api$.error(err);
        });
    });

    return this.api$.pipe(first());
  }

  private formatApiUrl(): string {
    return "https://maps.googleapis.com/maps/api/js?key=" + this.mapApiKey + "&callback=initMapApi";
  }

  // OnDestroy overrides
  ngOnDestroy() {
    this.api$.complete();
  }
}
