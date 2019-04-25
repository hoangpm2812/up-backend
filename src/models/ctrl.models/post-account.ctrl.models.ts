import {model, property, Entity} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostAccountModel extends Entity {
  @property({required: true})
  email: string;
  @property({required: true})
  password: string;
  @property({required: true})
  name: string;

  constructor(data?: Partial<PostAccountModel>) {
    super(data);
    AppValidate.email(this.email);
    AppValidate.password(this.password);
    AppValidate.acountName(this.name);
  }
}
