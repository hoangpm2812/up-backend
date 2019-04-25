import {model, property, belongsTo} from '@loopback/repository';
import {BaseModel} from './base-model.db.models';
import {User, Store} from '.';
import {StoreLocation} from './store-location.db.models';

@model()
export class UserRefillHistory extends BaseModel {
  @property({id: true})
  id: string;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Store)
  storeId: string;

  @belongsTo(() => StoreLocation)
  storeLocationId: string;

  @property({required: true})
  lat: number;

  @property({required: true})
  lng: number;

  constructor(data?: Partial<UserRefillHistory>) {
    super(data);
  }
}
