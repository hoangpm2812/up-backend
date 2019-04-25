import {model, property, Entity} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostStoreInfoModel extends Entity {
  @property({required: true})
  name: string;
  @property({default: 'all day'})
  openingDays: string;
  @property({default: '24/24'})
  openingHours: string;
  @property({default: 'unknown'})
  typeStation: string;
  @property({default: 'unknown'})
  address: string;

  constructor(data?: Partial<PostStoreInfoModel>) {
    super(data);
    AppValidate.acountName(this.name);
  }
}
