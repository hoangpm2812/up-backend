import {property, hasMany, model} from '@loopback/repository';
import {Account} from './account.db.models';
import {Product} from '.';
import {StoreLocation} from './store-location.db.models';

@model()
export class Store extends Account {
  @property({id: true})
  id: string;

  @property({required: true, default: 'default.png'})
  imgUrl: string;

  @property({required: true, default: 'all day'})
  openingDays: string;

  @property({required: true, default: '24/24'})
  openingHours: string;

  @property({required: true, default: 'unknown'})
  typeStation: string;

  @property({required: true, default: 'unknown'})
  address: string;

  @hasMany(() => StoreLocation)
  locations?: StoreLocation[];

  @hasMany(() => Product)
  products?: Product[];

  constructor(data?: Partial<Store>) {
    super(data);
  }
}
