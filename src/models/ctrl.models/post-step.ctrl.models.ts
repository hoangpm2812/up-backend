import {model, property, Entity} from '@loopback/repository';
import {AppValidate} from '../../controllers/common';

@model()
export class PostStep extends Entity {
  @property({required: true})
  date: Date;

  @property({required: true})
  step: number;

  constructor(data?: Partial<PostStep>) {
    super(data);
    AppValidate.step(this.step);
  }
}

@model()
export class PostStepModel extends Entity {
  @property.array(() => PostStep)
  stepList: PostStep[];

  constructor(data?: Partial<PostStepModel>) {
    super(data);
  }
}
