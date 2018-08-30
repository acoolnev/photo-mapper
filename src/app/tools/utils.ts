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
