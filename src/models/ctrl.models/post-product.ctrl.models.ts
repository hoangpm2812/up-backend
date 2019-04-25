import {model, property, Entity} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostProductModel extends Entity {
  @property({default: 'other'})
  categoryName: string;
  @property()
  imgUrl?: string;
  @property({required: true})
  name: string;
  @property({required: true, default: 0})
  point: number;
  @property({required: true})
  dueDate: Date;
  @property({required: true, default: 0})
  quantity: number;

  constructor(data?: Partial<PostProductModel>) {
    super(data);
    console.log(this);
    AppValidate.productName(this.name);
    this.point = AppValidate.point(this.point);
    this.dueDate = AppValidate.duedate(this.dueDate);
    this.quantity = AppValidate.quantity(this.quantity, this.quantity);
  }
}

@model()
export class PostProductEditModel extends Entity {
  @property({default: 'other'})
  categoryName: string;
  @property()
  imgUrl?: string;
  @property({required: true})
  name: string;
  @property({required: true, default: 0})
  point: number;
  @property({required: true})
  dueDate: Date;

  constructor(data?: Partial<PostProductModel>) {
    super(data);
    AppValidate.productName(this.name);
    this.point = AppValidate.point(this.point);
    this.dueDate = AppValidate.duedate(this.dueDate);
  }
}
