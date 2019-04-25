import {property, belongsTo, model} from '@loopback/repository';
import {BaseModel} from './base-model.db.models';
import {Store, Category} from '.';

@model()
export class Product extends BaseModel {
  @property({id: true})
  id: string;

  @belongsTo(() => Store)
  storeId: string;

  @belongsTo(() => Category)
  categoryId: string;

  @property({default: 'default.png'})
  imgUrl: string;

  @property({required: true})
  name: string;

  @property({required: true, default: 0})
  point: number;

  @property({required: true})
  dueDate: Date;

  @property({required: true, default: 0})
  quantity: number;

  @property({required: true, default: 0})
  total: number;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}
