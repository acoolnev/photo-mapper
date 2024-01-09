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
