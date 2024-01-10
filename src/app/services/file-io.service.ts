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
import { saveAs } from 'file-saver/src/FileSaver';
import { fromEvent, merge, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { dataUrlToBlob } from '../tools/utils' 

@Injectable()
export class FileIo {
  load(file: File) : Observable<string> {
    let reader = new FileReader();
    let load$ = fromEvent(reader, 'loadend').pipe(
      map(event => {
         return (event.target as FileReader).result;
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

  save(dataUrl: string, fileName: string) {
    const blob = dataUrlToBlob(dataUrl);
    saveAs(blob, fileName);
  }
}
