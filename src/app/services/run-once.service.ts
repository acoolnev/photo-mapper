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

import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class RunOnce implements OnDestroy {
  private tokens = new Map<string, ReplaySubject<any>>();
  
  run(token: string, fn: () => any ) : Observable<any> {
    let result$: ReplaySubject<any>;
 
    if (!this.tokens.has(token)) {
      result$ = new ReplaySubject(1);
      let result = fn();
      if (result instanceof Observable) {
        (<Observable<any>>result).subscribe(result$);
      }
      else {
        result$.subscribe(result);
      }
      this.tokens.set(token, result$);
    }
    else {
      result$ = this.tokens.get(token);
    }
 
    return result$;
  }

  // OnDestroy overrides
  ngOnDestroy() {
    this.tokens.forEach((value, key) => {
      value.complete();
    });
  }
}
