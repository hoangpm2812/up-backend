import {model, property} from '@loopback/repository';
import {BaseModel} from './base-model.db.models';

@model()
export class Account extends BaseModel {
  @property({required: true})
  email: string;

  @property({required: true})
  password: string;

  @property({required: true})
  name: string;

  constructor(data?: Partial<Account>) {
    super(data);
  }
}
