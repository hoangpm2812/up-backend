import {property, model, belongsTo} from '@loopback/repository';
import {BaseModel} from './base-model.db.models';
import {Store} from '.';
import {Constant} from '../../controllers/common';

@model()
export class StoreLocation extends BaseModel {
  @property({id: true})
  id: string;

  @belongsTo(() => Store)
  storeId: string;

  @property({required: true, default: 'unknown'})
  address: string;

  @property({required: true, default: 0})
  lat: number;

  @property({required: true, default: 0})
  lng: number;

  @property({required: true, default: 0})
  bottleVolumn: number;

  @property({required: true, default: 0})
  currentWatter: number;

  @property({required: true, default: 0})
  refillPrice: number;

  @property({required: true, default: Constant.STATE.ACTIVE})
  state: string;

  constructor(data?: Partial<StoreLocation>) {
    super(data);
  }
}
