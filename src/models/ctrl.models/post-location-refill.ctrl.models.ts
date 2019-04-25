import {model, Entity, property} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostLocationRefillModel extends Entity {
  @property({required: true, default: 'unknown'})
  address: string;
  @property({required: true})
  lat: number;
  @property({required: true})
  lng: number;
  @property({required: true})
  bottleVolumn: number;
  @property({default: 0})
  currentWatter: number;
  @property({required: true})
  refillPrice: number;

  constructor(data?: Partial<PostLocationRefillModel>) {
    super(data);
    AppValidate.latLng(this.lat, this.lng);
    AppValidate.bottle(this.bottleVolumn);
    AppValidate.currentWater(this.bottleVolumn, this.currentWatter);
    AppValidate.price(this.refillPrice);
  }
}
