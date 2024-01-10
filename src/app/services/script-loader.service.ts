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
