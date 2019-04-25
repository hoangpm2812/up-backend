import {model, property, Entity} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostBottleModel extends Entity {
  @property({required: true})
  bottleVolumn: number;

  constructor(data?: Partial<PostBottleModel>) {
    super(data);
    AppValidate.bottle(this.bottleVolumn);
  }
}
