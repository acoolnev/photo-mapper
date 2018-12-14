import * as piexif from './piexif.js';

export function hasGpsInfo(jpegDataUrl: string) : boolean {
  let exif = piexif.load(jpegDataUrl);
  let gpsData = exif['GPS'];
  let gpsTags = [piexif.GPSIFD.GPSLatitudeRef, piexif.GPSIFD.GPSLatitude,
                 piexif.GPSIFD.GPSLongitudeRef, piexif.GPSIFD.GPSLongitude];
  
  let hasGps: boolean = true;
  for (let tag of gpsTags) {
    hasGps = hasGps && gpsData[tag];
    if (!hasGps)
      break;
  }
  return hasGps;
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

export function appendPrototype(src: any, dst: any) {
  for (let prop in src.prototype) {
    dst.prototype[prop] = src.prototype[prop];
  }  
}
