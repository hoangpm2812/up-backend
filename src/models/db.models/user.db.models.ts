import {model, property, hasMany} from '@loopback/repository';
import {Account} from './account.db.models';
import {UserStepHistory, UserRefillHistory, UserExchangeHistory} from '.';

@model()
export class User extends Account {
  @property({id: true})
  id: string;

  @property({default: 'default.png'})
  imgUrl: string;

  @property({required: true, default: 0})
  currentPoint: number;

  @property({required: true, default: 0})
  stepTemp: number;

  @property({required: true, default: 0})
  bottleVolumn: number;

  @hasMany(() => UserStepHistory)
  stepHistory?: UserStepHistory[];

  @hasMany(() => UserRefillHistory)
  refillHistory?: UserRefillHistory[];

  @hasMany(() => UserExchangeHistory)
  exchangeHistory?: UserExchangeHistory[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}
