import {model, property, belongsTo} from '@loopback/repository';
import {BaseModel} from './base-model.db.models';
import {User} from '.';

@model()
export class UserStepHistory extends BaseModel {
  @property({id: true})
  id: string;

  @belongsTo(() => User)
  userId: String;

  @property({required: true})
  date: Date;

  @property({required: true, default: 0})
  step: number;

  constructor(data?: Partial<UserStepHistory>) {
    super(data);
  }
}
