import dateformat = require('dateformat');
import fs = require('fs');
import {repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  requestBody,
  Request,
  RestBindings,
  Response,
} from '@loopback/rest';
import {
  UserRepository,
  StoreRepository,
  StoreLocationRepository,
  ProductRepository,
  CategoryRepository,
  UserExchangeHistoryRepository,
} from '../repositories';
import {inject, Setter} from '@loopback/core';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import * as specs from './specs/common.specs';
import {PasswordHasher} from '../authentication/services/hash.password.bcryptjs';
import {JWTAuthenticationService} from '../authentication/services/JWT.authentication.service';
import {
  JWTAuthenticationBindings,
  PasswordHasherBindings,
} from '../authentication/keys';
import {Role, AuthProfile, Credentials} from '../authentication/types';
import {Helper} from './common/helper';
import {
  PostAccountModel,
  AppResponse,
  PostStepModel,
  RespUserInfoModel,
  PostBottleModel,
  PostPositionModel,
  RespExchangeModel,
  RespStepHistoryModel,
  PostUserInfoModel,
  PostStep,
  LocationRefillDetailResModel,
  RespLocationRefillModel,
  RespProductModel,
} from '../models/ctrl.models';
import {AppValidate, Upload, Constant} from './common';
import {
  UserRefillHistory,
  UserExchangeHistory,
  Store,
  Category,
  User,
  UserStepHistory,
} from '../models/db.models';

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(StoreLocationRepository)
    public storeLocationRepository: StoreLocationRepository,
    @repository(StoreRepository) public storeRepository: StoreRepository,
    @repository(ProductRepository) public productRepository: ProductRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
    @repository(UserExchangeHistoryRepository)
    public userExchangeHistoryRepository: UserExchangeHistoryRepository,
    @inject.setter(AuthenticationBindings.CURRENT_USER)
    public setCurrentUser: Setter<AuthProfile>,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHahser: PasswordHasher,
    @inject(JWTAuthenticationBindings.SERVICE)
    public jwtAuthenticationService: JWTAuthenticationService,
  ) {}

  @post('/api/user/register', specs.responseSuccess)
  async userRegister(
    @requestBody() accountModel: PostAccountModel,
  ): Promise<AppResponse> {
    accountModel = new PostAccountModel(accountModel);

    const foundUser = await this.userRepository.findOne({
      where: {email: accountModel.email},
    });
    if (foundUser) {
      throw new AppResponse({
        code: 400,
        message: 'User with email has existed.',
      });
    }
    accountModel.password = await this.passwordHahser.hashPassword(
      accountModel.password,
    );
    const user = new User(accountModel);
    await this.userRepository.create(user);
    return new AppResponse();
  }

  @post('/api/user/login', specs.responseSuccess)
  async userLogin(
    @requestBody() credentials: Credentials,
  ): Promise<AppResponse> {
    const token = await this.jwtAuthenticationService.getAccessTokenForAcount(
      credentials,
      Role.user,
    );
    return new AppResponse({data: {token: token}});
  }

  @get('/api/user/info', specs.responseSuccess)
  @authenticate('jwt')
  async userGetInfo(
    @inject('authentication.currentUser') currentUser: AuthProfile,
  ): Promise<AppResponse> {
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 404});
      });
    return new AppResponse({data: new RespUserInfoModel(user)});
  }

  @post('/api/user/info', specs.responseSuccess)
  @authenticate('jwt')
  async userEditInfo(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody() userInfo: PostUserInfoModel,
  ): Promise<AppResponse> {
    userInfo = new PostUserInfoModel(userInfo);
    let user = await this.userRepository.findById(currentUser.id).catch(err => {
      throw new AppResponse({code: 401});
    });
    await this.userRepository
      .updateById(currentUser.id, {
        name: userInfo.name,
        updatedAt: new Date(),
      })
      .catch(err => {
        throw new AppResponse({code: 500});
      });
    user.name = userInfo.name;
    return new AppResponse({data: new RespUserInfoModel(user)});
  }

  @post('/api/user/avatar', specs.responseSuccess)
  @authenticate('jwt')
  async userUploadAvatar(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody(specs.requestBodyUpload) request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<AppResponse> {
    let user = await this.userRepository.findById(currentUser.id).catch(err => {
      throw new AppResponse({code: 401});
    });
    const fileName = await Upload.handleUpload(
      Upload.userImgStorage,
      'avatar',
      request,
      response,
    );
    try {
      if (fileName) {
        await this.userRepository.updateById(currentUser.id, {
          imgUrl: fileName,
          updatedAt: new Date(),
        });
      } else {
        await this.userRepository.updateById(currentUser.id, {
          imgUrl: 'default.png',
          updatedAt: new Date(),
        });
      }

      if (user.imgUrl !== 'default.png') {
        try {
          fs.unlinkSync(
            Helper.getImageUrlLocal(Upload.userImageFolder, user.imgUrl),
          );
        } catch (error) {}
      }
    } catch (error) {
      if (request.file) {
        Upload.productImgStorage._removeFile(request, request.file, err => {});
      }
      throw error;
    }
    user.imgUrl = fileName;
    return new AppResponse({data: new RespUserInfoModel(user)});
  }

  @get('/api/user/token', specs.responseSuccess)
  @authenticate('jwt')
  async userToken(
    @inject('authentication.currentUser') currentUser: AuthProfile,
  ): Promise<AppResponse> {
    return new AppResponse({data: currentUser});
  }

  @get('/api/user/step', specs.responseSuccess)
  @authenticate('jwt')
  async userGetStepHistory(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.query.string('type') type: string,
  ): Promise<AppResponse> {
    const date = Helper.getDate();
    let data: RespStepHistoryModel[] = [];

    switch (type) {
      case 'day':
        await this.userRepository
          .stepHistory(currentUser.id)
          .find(
            {
              fields: {date: true, step: true},
              where: {
                and: [
                  {
                    date: {
                      gt: new Date(
                        date.getTime() -
                          Constant.MILLISEC_PER_DAY *
                            Constant.MAX_STEP_HISTORY_RESPONSE_NUMBER,
                      ),
                    },
                  },
                  {date: {lte: date}},
                ],
              },
              order: ['date DESC'],
            },
            {strictObjectIDCoercion: true},
          )
          .then(value => {
            let valueIdx = 0;
            // tslint:disable-next-line:prefer-for-of
            for (
              let i = 0;
              i < Constant.MAX_STEP_HISTORY_RESPONSE_NUMBER;
              i++
            ) {
              let _date = new Date(
                date.getTime() - Constant.MILLISEC_PER_DAY * i,
              );
              const time = dateformat(
                _date,
                Constant.STEP_COUNT_DATE_TIME_FORMAT,
              );
              if (
                valueIdx < value.length &&
                value[valueIdx].date.getMonth() === _date.getMonth() &&
                value[valueIdx].date.getDay() === _date.getDay()
              ) {
                data.push(new RespStepHistoryModel(time, value[valueIdx].step));
                valueIdx++;
              } else {
                data.push(new RespStepHistoryModel(time));
              }
            }
          });
        break;
      case 'month':
        for (let i = 0; i < 12; i++) {
          data.push(new RespStepHistoryModel((i + 1).toString()));
        }
        await this.userRepository
          .stepHistory(currentUser.id)
          .find(
            {
              fields: {date: true, step: true},
              where: {
                and: [
                  {date: {gte: new Date(date.getFullYear() + '-1')}},
                  {date: {lte: date}},
                ],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(value => {
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < value.length; i++) {
              const month = value[i].date.getMonth();
              data[month].addStep(value[i].step);
            }
          });
        break;
    }
    return new AppResponse({data: {stepHistoryList: data}});
  }

  @post('/api/user/step', specs.responseSuccess)
  @authenticate('jwt')
  async userAddStep(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody() stepModel: PostStepModel,
  ): Promise<AppResponse> {
    if (stepModel.stepList === undefined || stepModel.stepList.length === 0) {
      throw new AppResponse({code: 400});
    }
    stepModel.stepList.forEach(value => {
      value = new PostStep(value);
    });

    let user = await this.userRepository.findById(currentUser.id).catch(err => {
      throw new AppResponse({code: 401});
    });

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < stepModel.stepList.length; i++) {
      let currDate = Helper.getDate(stepModel.stepList[i].date);
      let deltaStep = stepModel.stepList[i].step;

      let stepCountHistories = await this.userRepository
        .stepHistory(user.id)
        .find({where: {date: currDate}}, {strictObjectIDCoercion: true});
      if (stepCountHistories.length > 0) {
        deltaStep -= stepCountHistories[0].step;
        await this.userRepository.stepHistory(user.id).patch(
          {
            step: stepModel.stepList[i].step,
            updatedAt: new Date(),
          },
          {date: currDate},
          {strictObjectIDCoercion: true},
        );
      } else {
        let stepCountHistory = new UserStepHistory();
        stepCountHistory.step = deltaStep;
        stepCountHistory.date = currDate;
        await this.userRepository
          .stepHistory(user.id)
          .create(stepCountHistory, {
            strictObjectIDCoercion: true,
          });
      }
      user.stepTemp = user.stepTemp + deltaStep;
    }

    if (user.stepTemp >= Constant.STEPCOUNT_PER_POINT) {
      user.currentPoint =
        user.currentPoint +
        Math.ceil(user.stepTemp / Constant.STEPCOUNT_PER_POINT);
      user.stepTemp = user.stepTemp % Constant.STEPCOUNT_PER_POINT;
    }

    await this.userRepository.updateById(user.id, {
      currentPoint: user.currentPoint,
      stepTemp: user.stepTemp,
      updatedAt: new Date(),
    });

    return new AppResponse({data: new RespUserInfoModel(user)});
  }

  @get('/api/user/store', specs.responseSuccess)
  @authenticate('jwt')
  async userGetStoreByLocation(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.query.number('lat') lat: number,
    @param.query.number('lng') lng: number,
  ): Promise<AppResponse> {
    AppValidate.latLng(lat, lng);

    // const detaLatLng = Helper.getDeltaLatLng(Constant.MAX_NEAR_DISTANCE);
    // const fromLat = lat - detaLatLng;
    // const fromLng = lng - detaLatLng;
    // const toLat = lat + detaLatLng;
    // const toLng = lng + detaLatLng;

    // const stores = await this.find({
    //   where: {
    //     and: [
    //       {lat: {gte: fromLat}},
    //       {lng: {gte: fromLng}},
    //       {lat: {lte: toLat}},
    //       {lng: {lte: toLng}},
    //     ],
    //   },
    // });

    let locations = await this.storeLocationRepository.find();
    //console.log(locations);

    let result: RespLocationRefillModel[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < locations.length; i++) {
      const store = await this.storeRepository.findById(locations[i].storeId);
      let distance = Helper.distanceLocation(
        lat,
        lng,
        locations[i].lat,
        locations[i].lng,
      );
      let storeRes = new RespLocationRefillModel(store, locations[i], distance);
      storeRes._distance = distance;
      //if (distance <= Constant.MAX_NEAR_DISTANCE) {
      //console.log(storeRes);
      result.push(storeRes);
    }
    await result.sort((a, b) => {
      return (a._distance && b._distance && a._distance - b._distance) || 0;
    });
    //console.log(result);
    result = result.slice(
      0,
      (result.length >= Constant.MAX_REFILL_LOCATION_RESPONSE_NUMBER &&
        Constant.MAX_REFILL_LOCATION_RESPONSE_NUMBER) ||
        result.length,
    );

    return new AppResponse({data: {listStore: result}});
  }

  @get('/api/user/store/{storeLocationId}', specs.responseSuccess)
  @authenticate('jwt')
  async userGetStoreDetail(
    @param.path.string('storeLocationId') storeLocationId: string,
    @param.query.number('lat') lat: number,
    @param.query.number('lng') lng: number,
  ): Promise<AppResponse> {
    const location = await this.storeLocationRepository
      .findById(storeLocationId)
      .catch(err => {
        throw new AppResponse({code: 404});
      });

    const store = await this.storeRepository.findById(location.storeId);
    let data = new LocationRefillDetailResModel(store, location);

    if (data && lat && lng) {
      data.setDistance(
        Helper.distanceLocation(lat, lng, location.lat, location.lng),
      );
    }
    return new AppResponse({data: data});
  }

  @get('/api/user/bottle', specs.responseSuccess)
  @authenticate('jwt')
  async userGetBottle(
    @inject('authentication.currentUser') currentUser: AuthProfile,
  ): Promise<AppResponse> {
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    return new AppResponse({
      data: {isValidBottle: user.bottleVolumn !== 0},
    });
  }

  @post('/api/user/bottle', specs.responseSuccess)
  @authenticate('jwt')
  async userPostBottle(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody() bottle: PostBottleModel,
  ): Promise<AppResponse> {
    bottle = new PostBottleModel(bottle);
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    await this.userRepository
      .updateById(user.id, {bottleVolumn: bottle.bottleVolumn})
      .catch(err => {
        throw new AppResponse({code: 500});
      });
    return new AppResponse();
  }

  @post('/api/user/refill/{storeLocationId}', specs.responseSuccess)
  @authenticate('jwt')
  async userRefill(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.path.string('storeLocationId') storeLocationId: string,
    @requestBody() position: PostPositionModel,
  ): Promise<AppResponse> {
    position = new PostPositionModel(position);
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    const location = await this.storeLocationRepository.findById(
      storeLocationId,
    );
    const store = await this.storeRepository
      .findById(location.storeId)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'Invalid store'});
      });
    const distance = Helper.distanceLocation(
      position.lat,
      position.lng,
      location.lat,
      location.lng,
    );
    if (distance > Constant.MAX_REFILL_DISTANCE) {
      throw new AppResponse({
        code: 400,
        message: 'You should go to store to refill',
      });
    }
    if (user.bottleVolumn <= 0) {
      throw new AppResponse({
        code: 400,
        message: 'You should have bottle to refill',
      });
    }
    const currDate = Helper.getDate();
    const refillHistory = await this.userRepository
      .refillHistory(currentUser.id)
      .find(
        {
          where: {
            and: [
              {createdAt: {gt: currDate}},
              {
                createdAt: {
                  lt: new Date(currDate.getTime() + Constant.MILLISEC_PER_DAY),
                },
              },
            ],
          },
        },
        {
          strictObjectIDCoercion: true,
        },
      );
    //console.log(refillHistory);
    if (refillHistory) {
      if (refillHistory.length > 5) {
        throw new AppResponse({
          code: 400,
          message: 'Max refill',
        });
      }
    }
    let newRefillHistory = new UserRefillHistory({
      storeId: store.id,
      storeLocationId: location.id,
      lat: position.lat,
      lng: position.lng,
    });
    newRefillHistory = await this.userRepository
      .refillHistory(user.id)
      .create(newRefillHistory);
    await this.userRepository.updateById(user.id, {
      currentPoint: user.currentPoint + Constant.POINT_PER_REFILL,
      updatedAt: new Date(),
    });
    return new AppResponse();
  }

  @get('/api/user/product', specs.responseSuccess)
  @authenticate('jwt')
  async userGetProductByCategoryName(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.query.string('categoryName') categoryName: string,
  ): Promise<AppResponse> {
    if (categoryName === undefined) {
      throw new AppResponse({code: 400});
    }
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    let data = [];
    if (categoryName.toLocaleLowerCase() === 'all') {
      let products = await this.productRepository.find({
        where: {quantity: {gt: 0}},
        order: ['createdAt DESC'],
      });

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < products.length; i++) {
        let store = await this.storeRepository
          .findById(products[i].storeId)
          .catch(err => {
            return new Store();
          });
        let category = await this.categoryRepository
          .findById(products[i].categoryId)
          .catch(err => {
            return new Category();
          });
        let result: RespProductModel;
        result = new RespProductModel(products[i], store, category);
        data.push(result);
      }
    } else {
      const category = await this.categoryRepository.findOne({
        where: {name: {eq: categoryName.toLocaleLowerCase()}},
      });
      if (category !== null) {
        const products = await this.categoryRepository
          .products(category.id)
          .find(
            {where: {quantity: {gt: 0}}, order: ['createdAt DESC']},
            {
              strictObjectIDCoercion: true,
            },
          );
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < products.length; i++) {
          let store = await this.storeRepository.findById(products[i].storeId);
          let result = new RespProductModel(
            products[i],
            store,
            category,
            user.currentPoint,
          );
          data.push(result);
        }
      }
    }
    return new AppResponse({data: {productList: data}});
  }

  @post('/api/user/buy/{productId}', specs.responseSuccess)
  @authenticate('jwt')
  async userBuyProduct(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.path.string('productId') productId: string,
  ): Promise<AppResponse> {
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    const product = await this.productRepository
      .findById(productId)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'Invalid product'});
      });
    if (product.quantity <= 0) {
      throw new AppResponse({code: 400, message: 'Invalid product'});
    }
    if (user.currentPoint >= product.point) {
      let exchangeHistory = new UserExchangeHistory({
        productId: productId,
        point: product.point,
        received: false,
        dueDate: new Date(
          new Date().getTime() +
            Constant.MAX_EXCHANGE_DUEDATE * Constant.MILLISEC_PER_DAY,
        ),
      });
      await this.userRepository.updateById(user.id, {
        currentPoint: user.currentPoint - product.point,
        updatedAt: new Date(),
      });
      await this.productRepository
        .updateById(product.id, {
          quantity: product.quantity - 1,
          updatedAt: new Date(),
        })
        .catch(err => {
          throw new AppResponse({code: 500});
        });
      await this.userRepository
        .exchangeHistory(user.id)
        .create(exchangeHistory)
        .catch(err => {
          throw new AppResponse({code: 500});
        });
      return new AppResponse();
    } else {
      throw new AppResponse({code: 400, message: 'Not enough point'});
    }
  }

  @get('/api/user/reward', specs.responseSuccess)
  @authenticate('jwt')
  async userGetBuy(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.query.string('type') type: string,
  ): Promise<AppResponse> {
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    let exchanges;
    switch (type.toLocaleLowerCase()) {
      case 'all':
        exchanges = await this.userRepository
          .exchangeHistory(user.id)
          .find(
            {order: ['received ASC', 'createdAt DESC']},
            {strictObjectIDCoercion: true},
          );
        break;
      case 'available':
        exchanges = await this.userRepository
          .exchangeHistory(user.id)
          .find(
            {where: {received: false}, order: ['createdAt DESC']},
            {strictObjectIDCoercion: true},
          );
        break;
      case 'used':
        exchanges = await this.userRepository
          .exchangeHistory(user.id)
          .find(
            {where: {received: true}, order: ['createdAt DESC']},
            {strictObjectIDCoercion: true},
          );
        break;
    }
    let results = [];
    if (exchanges && exchanges.length > 0) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < exchanges.length; i++) {
        let product = await this.productRepository.findById(
          exchanges[i].productId,
        );
        let store = await this.storeRepository
          .findById(product.storeId)
          .catch(err => {
            return new Store();
          });
        let category = await this.categoryRepository
          .findById(product.categoryId)
          .catch(err => {
            return new Category();
          });
        let result: RespExchangeModel;
        product.point = exchanges[i].point;
        result = new RespExchangeModel(exchanges[i], product, store, category);
        results.push(result);
      }
    }
    return new AppResponse({data: {rewardList: results}});
  }

  @get('/api/user/reward/{exchangeId}', specs.responseSuccess)
  @authenticate('jwt')
  async userGetBuyDetail(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.path.string('exchangeId') exchangeId: string,
  ) {
    if (exchangeId === undefined) {
      throw new AppResponse({code: 400});
    }
    const user = await this.userRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    const exchange = await this.userExchangeHistoryRepository
      .findById(exchangeId)
      .catch(err => {
        throw new AppResponse({code: 404});
      });
    if (user.id !== exchange.userId) {
      throw new AppResponse({code: 404});
    }
    if (exchange.dueDate < new Date() || exchange.received) {
      throw new AppResponse({code: 400, message: 'Reward was received'});
    }

    const product = await this.productRepository.findById(exchange.productId);
    const store = await this.storeRepository
      .findById(product.storeId)
      .catch(err => {
        return undefined;
      });
    const category = await this.categoryRepository
      .findById(product.categoryId)
      .catch(err => {
        return undefined;
      });

    return new AppResponse({
      data: {
        codeQR: exchange.id,
        product: new RespProductModel(product, store, category),
      },
    });
  }
}
