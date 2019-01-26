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
