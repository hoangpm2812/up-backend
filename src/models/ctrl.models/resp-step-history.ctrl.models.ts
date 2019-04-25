import {Helper, Constant} from '../../controllers/common';

export class RespStepHistoryModel {
  time: string;
  step: number;
  calories: number;
  distance: string;

  constructor(time: string, step?: number) {
    this.time = time;
    this.step = (step && step) || 0;
    this.calories = this.step * Constant.CALORIES_PER_STEP;
    this.distance = Helper.distanceToString(
      this.step * Constant.DISTANCE_PER_STEP,
    );
  }

  addStep(step: number) {
    this.step += step;
    this.calories = this.step * Constant.CALORIES_PER_STEP;
    this.distance = Helper.distanceToString(
      this.step * Constant.DISTANCE_PER_STEP,
    );
  }
}
