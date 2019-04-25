import {model, property, hasMany, Entity} from '@loopback/repository';
import {Product} from '.';

@model()
export class Category extends Entity {
  @property({id: true})
  id: string;

  @property({required: true})
  name: string;

  @hasMany(() => Product)
  products?: Product[];

  constructor(data?: Partial<Category>) {
    super(data);
  }
}
