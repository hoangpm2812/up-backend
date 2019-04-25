import {User} from '../db.models';
import {Upload, Helper} from '../../controllers/common';

export class RespUserInfoModel {
  name: string;
  imgUrl: string;
  currentPoint: number;
  bottleVolumn: number;

  constructor(user: User) {
    this.name = user.name;
    this.imgUrl = Helper.toImageURL(Upload.userImageFolder, user.imgUrl);
    this.currentPoint = user.currentPoint;
    this.bottleVolumn = user.bottleVolumn;
  }
}
