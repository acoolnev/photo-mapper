import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject } from 'rxjs';
import { first, map, mapTo, tap } from 'rxjs/operators';
import { RunOnce } from './run-once.service'

declare var document: any;

@Injectable()
export class ScriptLoader {

constructor(private runOnce: RunOnce) {}

load(scriptUrl: string) {
  return this.runOnce.run(scriptUrl, () => {
    let script = document.createElement('script');
    script.type = 'text/javascript';

    let load$: Observable<string>;
    if (script.readyState) { // IE<10
      load$ = fromEvent(script, 'readystatechange').pipe(
        first(event => script.readyState === 'loaded' || script.readyState === 'complete'),
        // Avoid future loading events from this script (eg, if src changes)
        tap(value => script.onreadystatechange = null),
        mapTo(scriptUrl));
    } else { // Others
      load$ = fromEvent(script, 'load').pipe(mapTo(scriptUrl));
    }

    let error$ = fromEvent(script, 'error').pipe(map(value => {
      throw new Error(`Could not load script "${scriptUrl}"`);
    }));

    let result$ = new ReplaySubject(1);

    merge(load$, error$).pipe(first()).subscribe(result$);

    // Must set src AFTER adding onreadystatechange listener else we’ll miss
    // the loaded event for cached scripts.
    script.src = scriptUrl;
  
    document.getElementsByTagName('head')[0].appendChild(script);

    return result$;
  });
}

}
