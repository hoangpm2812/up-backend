import {model, Entity, property} from '@loopback/repository';

@model()
export class BaseModel extends Entity {
  @property()
  createdAt: Date;
  @property()
  updatedAt: Date;

  constructor(data?: Partial<BaseModel>) {
    super(data);
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
  }
}
