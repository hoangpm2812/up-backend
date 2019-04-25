import {property, model, belongsTo} from '@loopback/repository';
import {BaseModel} from './base-model.db.models';
import {Product} from './product.db.models';
import {User} from '.';

@model()
export class UserExchangeHistory extends BaseModel {
  @property({id: true})
  id: string;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Product)
  productId: string;

  @property()
  received: boolean;

  @property({required: true})
  dueDate: Date;

  @property()
  point: number;

  constructor(data?: Partial<UserExchangeHistory>) {
    super(data);
  }
}
