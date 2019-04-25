import {model, property, Entity} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostPositionModel extends Entity {
  @property()
  lat: number;
  @property()
  lng: number;

  constructor(data?: Partial<PostPositionModel>) {
    super(data);
    AppValidate.latLng(this.lat, this.lng);
  }
}
