import path = require('path');
import crypto = require('crypto');
import multer = require('multer');
import {Request, Response} from 'express-serve-static-core';
import {AppResponse} from '../../models/ctrl.models';

const IMAGE_TYPE = ['.jpg', '.png', '.jpeg'];

function validateImage(file: Express.Multer.File) {
  if (
    !file.mimetype.startsWith('image') ||
    !IMAGE_TYPE.includes(path.extname(file.originalname))
  ) {
    console.log(file.originalname);
    return new Error('client');
  } else {
    return null;
  }
}

function randomImageName(file: Express.Multer.File) {
  const buf = crypto.randomBytes(16);
  if (buf) {
    return (
      buf.toString('hex') +
      '-' +
      new Date().getTime() +
      path.extname(file.originalname)
    );
  } else {
    return '';
  }
}

export class Upload {
  static userImageFolder = 'image/user';
  static storeImageFolder = 'image/store';
  static productImageFolder = 'image/product';

  static createFileName(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) {
    let err = validateImage(file);
    let filename = randomImageName(file);
    if (filename === '') err = new Error('server error');
    callback(err, filename);
  }

  static userImgStorage = multer.diskStorage({
    destination: 'public/' + Upload.userImageFolder,
    filename: Upload.createFileName,
  });

  static storeImgStorage = multer.diskStorage({
    destination: 'public/' + Upload.storeImageFolder,
    filename: Upload.createFileName,
  });

  static productImgStorage = multer.diskStorage({
    destination: 'public/' + Upload.productImageFolder,
    filename: Upload.createFileName,
  });

  static handleUpload(
    storage: multer.StorageEngine,
    fieldName: string,
    request: Request,
    response: Response,
  ) {
    const upload = multer({
      storage: storage,
      limits: {fileSize: 5242880},
    }).single(fieldName);
    return new Promise<string>((resolve, reject) => {
      upload(request, response, err => {
        if (err) {
          if (err instanceof Error) {
            if (err.message.startsWith('client')) {
              reject(new AppResponse({code: 400, message: 'Invalid image'}));
            } else {
              reject(new AppResponse({code: 500}));
            }
          } else {
            reject(err);
          }
        } else {
          console.log((request.file && request.file.filename) || undefined);
          resolve((request.file && request.file.filename) || undefined);
        }
      });
    }).catch(reason => {
      throw reason;
    });
  }
}
