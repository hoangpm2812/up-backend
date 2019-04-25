import {Store} from '../db.models';
import {Helper, Upload} from '../../controllers/common';

export class RespStoreFewInfoModel {
  id: string;
  name: string;
  imgUrl: string;
  address: string;

  constructor(store: Store) {
    this.id = store.id;
    this.name = store.name;
    this.imgUrl = Helper.toImageURL(Upload.storeImageFolder, store.imgUrl);
    this.address = store.address;
  }
}

export class RespStoreInfoModel {
  name: string;
  imgUrl: string;
  openingDays: string;
  openingHours: string;
  typeStation: string;
  address: string;

  constructor(store: Store) {
    this.name = store.name;
    this.imgUrl = Helper.toImageURL(Upload.storeImageFolder, store.imgUrl);
    this.openingDays = store.openingDays;
    this.openingHours = store.openingHours;
    this.typeStation = store.typeStation;
    this.address = store.address;
  }
}
