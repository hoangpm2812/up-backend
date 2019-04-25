import {Store, StoreLocation} from '../db.models';
import {Helper, Upload, Constant} from '../../controllers/common';

export class RespLocationRefillModel {
  id: string;
  imgUrl: string;
  address: string;
  distance: string;
  _distance?: number;
  lat: number;
  lng: number;

  constructor(store: Store, location: StoreLocation, distance: number) {
    this.id = location.id;
    this.address = location.address;
    this.lat = location.lat;
    this.lng = location.lng;

    this.imgUrl = Helper.toImageURL(Upload.storeImageFolder, store.imgUrl);
    this.distance = Helper.distanceToString(distance);
  }
}

export class LocationRefillDetailResModel {
  id: string;
  name: string;
  imgUrl: string;
  address: string;
  openingDays: string;
  openingHours: string;
  refillPrice: number;
  typeStation: string;
  lat: number;
  lng: number;
  isValidPlace?: boolean;
  distance?: string;

  constructor(store: Store, location: StoreLocation, distance?: number) {
    this.id = location.id;
    this.address = location.address;
    this.lat = location.lat;
    this.lng = location.lng;

    this.name = store.name;
    this.imgUrl = Helper.toImageURL(Upload.storeImageFolder, store.imgUrl);
    this.openingDays = store.openingDays;
    this.openingHours = store.openingHours;
    this.refillPrice = location.refillPrice;
    this.typeStation = store.typeStation;

    this.distance =
      (distance !== undefined && Helper.distanceToString(distance)) ||
      undefined;
    this.isValidPlace =
      (distance !== undefined &&
        distance <= Constant.MAX_REFILL_DISTANCE &&
        true) ||
      false;
  }

  setDistance(distance: number) {
    this.distance =
      (distance !== undefined && Helper.distanceToString(distance)) ||
      undefined;
    this.isValidPlace =
      (distance !== undefined &&
        distance <= Constant.MAX_REFILL_DISTANCE &&
        true) ||
      false;
  }
}
