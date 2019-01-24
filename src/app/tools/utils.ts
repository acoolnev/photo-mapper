import * as piexif from './piexif.js';

export class Cancelation {
  cancel: boolean = false;
}

export class LatLng {
  lat: number;
  lng: number;
}

function getGpsData(jpegDataUrl: string) {
  let exif = piexif.load(jpegDataUrl);
  return exif['GPS'];
}

export function getGpsInfo(jpegDataUrl: string) : LatLng {
  let gpsData = getGpsData(jpegDataUrl);

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

export function addGpsInfo(jpegDataUrl: string, lat: number, lng: number) {
  let gpsIfd = {};
  gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
  gpsIfd[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lat));
  gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = lng < 0 ? 'W' : 'E';
  gpsIfd[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lng));

  let exifObj = {"GPS":gpsIfd};
  let exifBytes = piexif.dump(exifObj);
  return piexif.insert(exifBytes, jpegDataUrl); // JPEG data URL with GPS
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
