import isemail = require('isemail');
import {AppResponse} from '../../models/ctrl.models';

const regexPassword = '[a-zA-Z0-9!@#$%^&*_+ ]{8,}';
const regexAccName = '[a-zA-Z0-9 -]{6,}';
const regexProduct = '[a-zA-Z0-9 -]{6,}';

export class AppValidate {
  static email(email: string) {
    if (!isemail.validate(email)) {
      throw new AppResponse({code: 400, message: 'Invalid email'});
    }
  }
  static password(password: string) {
    if (!new RegExp(regexPassword).test(password)) {
      throw new AppResponse({
        code: 400,
        message:
          'Password must be minimum 8 characters in (a-zA-Z0-9!@#$%^&*_+ )',
      });
    }
  }
  static step(number: number) {
    if (Number.isNaN(number) || !Number.isInteger(number) || number < 0) {
      throw new AppResponse({code: 400, message: 'Invalid step'});
    }
  }
  static latLng(lat?: number, lng?: number) {
    if (
      lat === undefined ||
      lng === undefined ||
      lat < -180 ||
      lng < -180 ||
      lat > 180 ||
      lng > 180
    ) {
      throw new AppResponse({code: 400, message: 'Invalid lat lng'});
    }
  }
  static acountName(name: string) {
    if (!new RegExp(regexAccName).test(name)) {
      throw new AppResponse({
        code: 400,
        message: 'Name must be minimum 6 characters in (a-zA-Z0-9 -)',
      });
    }
  }
  static productName(name: string) {
    if (!new RegExp(regexProduct).test(name)) {
      throw new AppResponse({
        code: 400,
        message: 'Name must be minimum 6 characters in (a-zA-Z0-9 -)',
      });
    }
  }
  static price(number: number) {
    number = Number.parseFloat(number + '');
    if (Number.isNaN(number) || number < 0) {
      throw new AppResponse({code: 400, message: 'Invalid price'});
    }
    return number;
  }
  static point(number: number) {
    number = Number.parseInt(number + '');
    if (Number.isNaN(number) || number < 0) {
      throw new AppResponse({code: 400, message: 'Invalid point'});
    }
    return number;
  }
  static bottle(number: number) {
    number = Number.parseInt(number + '');
    if (Number.isNaN(number) || number <= 0) {
      throw new AppResponse({code: 400, message: 'Invalid bottle volumn'});
    }
    return number;
  }
  static currentWater(bottleVolumn: number, currentWater: number) {
    bottleVolumn = Number.parseInt(bottleVolumn + '');
    currentWater = Number.parseInt(currentWater + '');
    if (
      Number.isNaN(bottleVolumn) ||
      Number.isNaN(bottleVolumn) ||
      bottleVolumn < currentWater
    ) {
      throw new AppResponse({code: 400, message: 'Invalid current water'});
    }
    return currentWater;
  }
  static total(number: number) {
    number = Number.parseInt(number + '');
    if (Number.isNaN(number) || number <= 0) {
      throw new AppResponse({code: 400, message: 'Invalid total'});
    }
    return number;
  }
  static quantity(total: number, quantity: number) {
    total = Number.parseInt(total + '');
    quantity = Number.parseInt(quantity + '');
    if (
      Number.isNaN(total) ||
      Number.isNaN(quantity) ||
      total < quantity ||
      quantity < 0
    ) {
      throw new AppResponse({code: 400, message: 'Invalid quantity'});
    }
    return quantity;
  }
  static duedate(date: Date) {
    date = new Date(date);
    if (date.getTime === undefined || isNaN(date.getTime())) {
      throw new AppResponse({code: 400, message: 'Invalid due date'});
    }
    return date;
  }
}
