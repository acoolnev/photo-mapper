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
