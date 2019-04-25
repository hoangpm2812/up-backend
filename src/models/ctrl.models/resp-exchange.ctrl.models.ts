import {RespStoreFewInfoModel, RespCategoryInfoModel} from '.';
import {UserExchangeHistory, Product, Store, Category} from '../db.models';
import {Helper, Upload} from '../../controllers/common';
import _ = require('lodash');

export class RespExchangeModel {
  id: string;
  imgUrl: string;
  name: string;
  point: number;
  dueDate: Date;
  store?: RespStoreFewInfoModel;
  category?: RespCategoryInfoModel;
  isAvailable: boolean;

  constructor(
    exchange: UserExchangeHistory,
    product: Product,
    store?: Store,
    category?: Category,
  ) {
    this.id = exchange.id;
    this.imgUrl = Helper.toImageURL(Upload.productImageFolder, product.imgUrl);
    this.name = product.name;
    this.point = exchange.point;
    this.dueDate = exchange.dueDate;
    this.isAvailable = !exchange.received && exchange.dueDate >= new Date();

    if (store) {
      this.store = new RespStoreFewInfoModel(store);
    }
    if (category) {
      this.category = _.pick(category, ['name']);
    }
  }
}
