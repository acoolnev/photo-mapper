import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FileIo {
  load(file: File) : Observable<string> {
    let reader = new FileReader();
    let load$ = fromEvent(reader, 'loadend').pipe(
      map(event => {
         return (event as FileReaderProgressEvent).target.result;
    }));

    let error$ = fromEvent(reader, 'error').pipe(
      map(value => {
        throw new Error(`Could not load file "${file.name}"`);
    }));

    let result$ = new ReplaySubject<string>(1);
    merge(load$, error$).subscribe(result$);

    reader.readAsDataURL(file);

    return result$;
  }
}
