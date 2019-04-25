import {Store, Product, Category} from '../db.models';
import {Helper, Upload} from '../../controllers/common';
import {RespStoreFewInfoModel, RespCategoryInfoModel} from '.';
import _ = require('lodash');

export class RespProductModel {
  id: string;
  imgUrl: string;
  name: string;
  point: number;
  quantity: number;
  total: number;
  dueDate: Date;
  store?: RespStoreFewInfoModel;
  category?: RespCategoryInfoModel;
  userEnoughPoint?: boolean;

  constructor(
    product: Product,
    store?: Store,
    category?: Category,
    userPoint?: number,
  ) {
    this.id = product.id;
    this.imgUrl = Helper.toImageURL(Upload.productImageFolder, product.imgUrl);
    this.name = product.name;
    this.point = product.point;
    this.quantity = product.quantity;
    this.total = product.total;
    this.dueDate = product.dueDate;
    if (userPoint !== undefined) {
      this.userEnoughPoint = userPoint >= this.point;
    }
    if (store) {
      this.store = new RespStoreFewInfoModel(store);
    }
    if (category) {
      this.category = _.pick(category, ['name']);
    }
  }
}
