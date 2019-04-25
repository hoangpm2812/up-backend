import path = require('path');
import {Constant} from './const';
import {URL} from 'url';

export class Helper {
  static getDate(currDate?: Date): Date {
    currDate = (currDate && new Date(currDate)) || new Date();
    currDate.setHours(6, 0, 0, 0);
    return currDate;
  }

  static toImageURL(folder: string, file: string) {
    return new URL(path.join(Constant.HOST, folder, file)).toString();
  }

  static getImageUrlLocal(folder: string, file: string) {
    return path.join('public', folder, file);
  }

  static getDeltaLatLng(distance: number) {
    return (distance * 180) / Math.PI / Constant.EARTH_RADIUS;
  }

  static distanceToString(distance: number) {
    if (distance < 1000) {
      return Math.round(distance) + ' m';
    } else {
      return (distance / 1000).toFixed(2) + ' km';
    }
  }

  static distanceLocation(
    latSrc: number,
    lngSrc: number,
    latDes: number,
    lngDes: number,
  ) {
    const dLat = (latDes - latSrc) * (Math.PI / 180);
    const dLon = (lngDes - lngSrc) * (Math.PI / 180);
    const latSrcToRad = latSrc * (Math.PI / 180);
    const laDesToRad = latDes * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latSrcToRad) *
        Math.cos(laDesToRad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Constant.EARTH_RADIUS * c;
    return distance;
  }
}
