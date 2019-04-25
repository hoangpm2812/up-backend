import {model, Entity, property} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostUserInfoModel extends Entity {
  @property({required: true})
  name: string;

  constructor(data?: Partial<PostUserInfoModel>) {
    super(data);
    AppValidate.acountName(this.name);
  }
}
