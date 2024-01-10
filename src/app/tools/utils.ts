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

import * as piexif from './piexif.js';

export class Cancelation {
  cancel: boolean = false;
}

export class LatLng {
  lat: number;
  lng: number;
}

export function loadExifObject(jpegDataUrl: string) : object {
  return piexif.load(jpegDataUrl);
}

export function storeExifObject(exifObject: object, jpegDataUrl: string) : string {
  let exifBytes = piexif.dump(exifObject);
  return piexif.insert(exifBytes, jpegDataUrl); // JPEG data URL with GPS
}

export function getGpsInfo(exifObject: object) : LatLng {
  let gpsData = exifObject['GPS'];

  const gpsTags = [piexif.GPSIFD.GPSLatitudeRef, piexif.GPSIFD.GPSLatitude,
                   piexif.GPSIFD.GPSLongitudeRef, piexif.GPSIFD.GPSLongitude];

  for (let tag of gpsTags) {
    if (!gpsData[tag])
      return null;
  }

  const latRef = gpsData[piexif.GPSIFD.GPSLatitudeRef];
  const latDms = gpsData[piexif.GPSIFD.GPSLatitude];
  const lngRef = gpsData[piexif.GPSIFD.GPSLongitudeRef];
  const lngDms = gpsData[piexif.GPSIFD.GPSLongitude];

  return {lat: piexif.GPSHelper.dmsRationalToDeg(latDms, latRef),
          lng: piexif.GPSHelper.dmsRationalToDeg(lngDms, lngRef)};
}

export function addGpsInfo(exifObject: object, latLng: LatLng) {
  let gpsIfd = exifObject['GPS'];
  gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = latLng.lat < 0 ? 'S' : 'N';
  gpsIfd[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(Math.abs(latLng.lat));
  gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = latLng.lng < 0 ? 'W' : 'E';
  gpsIfd[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(Math.abs(latLng.lng));
}

export function binaryToArray(binary: string) : Uint8Array {
  let data: number[] = [];
  for (let i = 0; i < binary.length; ++i) {
      data[i] = binary.charCodeAt(i);
  }
  return new Uint8Array(data);
}

export function dataUrlToBlob(dataUrl: string) : Blob {
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const binaryData = atob(dataUrl.split(",")[1]);
  const arrayData = binaryToArray(binaryData);
  return new Blob([arrayData], {type: mimeString});
}

export function appendPrototype(src: any, dst: any) {
  for (let prop in src.prototype) {
    dst.prototype[prop] = src.prototype[prop];
  }  
}
