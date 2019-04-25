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
import {StoreRepository} from '../repositories/store.repository';
import {
  PostAccountModel,
  AppResponse,
  PostProductModel,
  RespStoreInfoModel,
  PostLocationRefillModel,
  PostStoreInfoModel,
  RespUserInfoModel,
  RespProductModel,
  PostQRCodeModel,
  PostProductEditModel,
} from '../models/ctrl.models';
import {
  CategoryRepository,
  UserExchangeHistoryRepository,
  UserRepository,
  StoreLocationRepository,
  ProductRepository,
} from '../repositories';
import {Upload, Helper} from './common';
import fs = require('fs');
import {StoreLocation, Store, Category, Product} from '../models/db.models';

export class StoreController {
  constructor(
    @repository(ProductRepository) public productRepository: ProductRepository,
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(StoreRepository) public storeRepository: StoreRepository,
    @repository(StoreLocationRepository)
    public storeLocationRepository: StoreLocationRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
    @repository(UserExchangeHistoryRepository)
    public exchangeHistoryRepository: UserExchangeHistoryRepository,
    @inject.setter(AuthenticationBindings.CURRENT_USER)
    public setCurrentUser: Setter<AuthProfile>,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHahser: PasswordHasher,
    @inject(JWTAuthenticationBindings.SERVICE)
    public jwtAuthenticationService: JWTAuthenticationService,
  ) {}

  @post('/api/store/register', specs.responseSuccess)
  async storeRegister(
    @requestBody() accountModel: PostAccountModel,
  ): Promise<AppResponse> {
    accountModel = new PostAccountModel(accountModel);
    const foundStore = await this.storeRepository.findOne({
      where: {email: accountModel.email},
    });
    if (foundStore) {
      throw new AppResponse({
        code: 406,
        message: 'Store with email has existed.',
      });
    }

    accountModel.password = await this.passwordHahser.hashPassword(
      accountModel.password,
    );
    const store = new Store(accountModel);
    await this.storeRepository.create(store);

    return new AppResponse();
  }

  @post('/api/store/login', specs.responseSuccess)
  async storeLogin(
    @requestBody() credentials: Credentials,
  ): Promise<AppResponse> {
    const token = await this.jwtAuthenticationService.getAccessTokenForAcount(
      credentials,
      Role.store,
    );
    return new AppResponse({data: {token: token}});
  }

  @get('/api/store/info', specs.responseSuccess)
  @authenticate('jwt')
  async storeGetInfo(
    @inject('authentication.currentUser') currentUser: AuthProfile,
  ): Promise<AppResponse> {
    let store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    return new AppResponse({data: new RespStoreInfoModel(store)});
  }

  @post('/api/store/info', specs.responseSuccess)
  @authenticate('jwt')
  async storeEditInfo(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody() storeInfo: PostStoreInfoModel,
  ): Promise<AppResponse> {
    console.log(storeInfo);
    storeInfo = new PostStoreInfoModel(storeInfo);
    let store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    await this.storeRepository
      .updateById(currentUser.id, storeInfo)
      .catch(err => {
        throw new AppResponse({code: 500});
      });
    store = await this.storeRepository.findById(currentUser.id).catch(err => {
      throw new AppResponse({code: 401});
    });
    return new AppResponse({data: new RespStoreInfoModel(store)});
  }

  @post('/api/store/avatar', specs.responseSuccess)
  @authenticate('jwt')
  async storeUploadAvatar(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody(specs.requestBodyUpload) request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<AppResponse> {
    let store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    const fileName = await Upload.handleUpload(
      Upload.storeImgStorage,
      'avatar',
      request,
      response,
    );
    try {
      if (fileName) {
        await this.storeRepository
          .updateById(store.id, {imgUrl: fileName})
          .catch(err => {
            throw new AppResponse({code: 500});
          });
      } else {
        await this.storeRepository
          .updateById(store.id, {
            imgUrl: 'default.png',
          })
          .catch(err => {
            throw new AppResponse({code: 500});
          });
      }

      if (store.imgUrl !== 'default.png') {
        try {
          fs.unlinkSync(
            Helper.getImageUrlLocal(Upload.storeImageFolder, store.imgUrl),
          );
        } catch (error) {}
      }
    } catch (error) {
      if (request.file) {
        Upload.productImgStorage._removeFile(request, request.file, err => {});
      }
      throw error;
    }
    store.imgUrl = (fileName && fileName) || 'default.png';
    return new AppResponse({data: new RespStoreInfoModel(store)});
  }

  @get('/api/store/token', specs.responseSuccess)
  @authenticate('jwt')
  async storeToken(
    @inject('authentication.currentUser') currentUser: AuthProfile,
  ): Promise<AppResponse> {
    return new AppResponse({data: currentUser});
  }

  @get('/api/store/product', specs.responseSuccess)
  @authenticate('jwt')
  async storeGetProduct(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.query.string('name') name: string,
  ): Promise<AppResponse> {
    let data: RespProductModel[] = [];
    const store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 404});
      });

    const products = await this.storeRepository.products(store.id).find(
      {
        where: (name && {name: {like: name}}) || undefined,
        order: ['createdAt DESC'],
      },
      {
        strictObjectIDCoercion: true,
      },
    );

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < products.length; i++) {
      let category = await this.categoryRepository
        .findById(products[i].categoryId)
        .catch(err => {
          return new Category();
        });
      let result: RespProductModel;
      result = new RespProductModel(products[i], store, category);
      data.push(result);
    }
    return new AppResponse({data: data});
  }

  @post('/api/store/product', specs.responseSuccess)
  @authenticate('jwt')
  async storeAddProduct(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody(specs.requestBodyUpload) request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<AppResponse> {
    let store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });

    const fileName = await Upload.handleUpload(
      Upload.productImgStorage,
      'avatar',
      request,
      response,
    );
    try {
      let productpos = new PostProductModel(request.body);

      productpos.imgUrl = fileName || undefined;

      let category = await this.categoryRepository.findOne({
        where: {name: productpos.categoryName.toLocaleLowerCase()},
      });
      if (category === null) {
        throw new AppResponse({code: 400, message: 'Category not found'});
      }
      delete productpos.categoryName;
      let product = new Product(productpos);
      product.categoryId = category.id;
      product.total = product.quantity;

      await this.storeRepository.products(store.id).create(product);
    } catch (error) {
      if (request.file) {
        Upload.productImgStorage._removeFile(request, request.file, err => {});
      }
      throw error;
    }
    return new AppResponse();
  }

  @post('/api/store/product/{productId}', specs.responseSuccess)
  @authenticate('jwt')
  async storeEditProduct(
    @param.path.string('productId') productId: string,
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody(specs.requestBodyUpload) request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<AppResponse> {
    let store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    const fileName = await Upload.handleUpload(
      Upload.productImgStorage,
      'avatar',
      request,
      response,
    );
    try {
      let productpos = new PostProductEditModel(request.body);

      const product = await this.productRepository
        .findById(productId)
        .catch(err => {
          throw new AppResponse({code: 404, message: 'Not found product'});
        });
      if (!product || product.storeId !== store.id) {
        throw new AppResponse({code: 404, message: 'Not found product'});
      }

      productpos.imgUrl = fileName || product.imgUrl;

      let category = await this.categoryRepository.findOne({
        where: {name: productpos.categoryName.toLocaleLowerCase()},
      });
      if (category === null) {
        throw new AppResponse({code: 400, message: 'Category not found'});
      }
      await this.productRepository.updateById(productId, {
        imgUrl: productpos.imgUrl,
        name: productpos.name,
        point: productpos.point,
        dueDate: productpos.dueDate,
        updatedAt: new Date(),
      });

      if (
        product.imgUrl !== productpos.imgUrl &&
        product.imgUrl !== 'default.png'
      ) {
        try {
          fs.unlinkSync(
            Helper.getImageUrlLocal(Upload.productImageFolder, product.imgUrl),
          );
        } catch (error) {}
      }
    } catch (error) {
      if (request.file) {
        Upload.productImgStorage._removeFile(request, request.file, err => {});
      }
      throw error;
    }
    return new AppResponse();
  }

  @get('/api/store/location', specs.responseSuccess)
  @authenticate('jwt')
  async storeGetLocation(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.query.string('address') address: string,
  ) {
    const data = await this.storeRepository.locations(currentUser.id).find(
      {
        where: (address && {address: address}) || undefined,
        fields: {createdAt: false, updatedAt: false, storeId: false},
      },
      {
        strictObjectIDCoercion: true,
      },
    );
    return new AppResponse({data: {locationList: data}});
  }

  @post('/api/store/location', specs.responseSuccess)
  @authenticate('jwt')
  async storeAddLocation(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody() storeLocation: PostLocationRefillModel,
  ) {
    storeLocation = new PostLocationRefillModel(storeLocation);
    if (storeLocation.refillPrice === undefined) {
      throw new AppResponse({code: 400, message: 'RefillPrice invalid'});
    }
    let store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });
    storeLocation.currentWatter = storeLocation.bottleVolumn;
    const newStoreLocation = new StoreLocation(storeLocation);
    await this.storeRepository.locations(store.id).create(newStoreLocation);

    return new AppResponse();
  }

  @post('/api/store/location/{storeLocationId}', specs.responseSuccess)
  @authenticate('jwt')
  async storeEditLocation(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.path.string('storeLocationId') storeLocationId: string,
    @requestBody() storeLocation: PostLocationRefillModel,
  ) {
    storeLocation = new PostLocationRefillModel(storeLocation);
    let store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 401});
      });

    let location = await this.storeLocationRepository
      .findById(storeLocationId)
      .catch(err => {
        throw new AppResponse({code: 404});
      });

    if (location.storeId !== store.id) {
      throw new AppResponse({code: 400, message: 'Location invalid'});
    }

    await this.storeLocationRepository.updateById(storeLocationId, {
      address: storeLocation.address,
      bottleVolumn: storeLocation.bottleVolumn,
      currentWatter: storeLocation.currentWatter,
      lat: storeLocation.lat,
      lng: storeLocation.lng,
      refillPrice: storeLocation.refillPrice,
      updatedAt: new Date(),
    });

    return new AppResponse();
  }

  @get('/api/store/exchange', specs.responseSuccess)
  @authenticate('jwt')
  async storeCheckExchange(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @param.query.string('code') code: string,
  ) {
    if (!code) {
      throw new AppResponse({code: 400, message: 'QRcode invalid'});
    }
    const store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 404});
      });
    const exchange = await this.exchangeHistoryRepository
      .findById(code)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'QRcode invalid'});
      });
    if (exchange.received) {
      throw new AppResponse({code: 400, message: 'QRcode is used'});
    }
    const user = await this.userRepository
      .findById(exchange.userId)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'QRcode invalid'});
      });
    const product = await this.productRepository
      .findById(exchange.productId)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'Product not found'});
      });

    if (product.storeId !== currentUser.id) {
      throw new AppResponse({code: 400, message: 'QRcode invalid with store'});
    }
    return new AppResponse({
      data: {
        userInfo: new RespUserInfoModel(user),
        product: new RespProductModel(product, store),
      },
    });
  }

  @post('/api/store/exchange', specs.responseSuccess)
  @authenticate('jwt')
  async storeExchanging(
    @inject('authentication.currentUser') currentUser: AuthProfile,
    @requestBody() code: PostQRCodeModel,
  ) {
    code = new PostQRCodeModel(code);
    if (!code) {
      throw new AppResponse({code: 400, message: 'QRcode invalid'});
    }
    const store = await this.storeRepository
      .findById(currentUser.id)
      .catch(err => {
        throw new AppResponse({code: 404});
      });
    const exchange = await this.exchangeHistoryRepository
      .findById(code.codeQR)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'QRcode invalid'});
      });
    if (exchange.received) {
      throw new AppResponse({code: 400, message: 'QRcode is used'});
    }
    const user = await this.userRepository
      .findById(exchange.userId)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'QRcode invalid'});
      });
    const product = await this.productRepository
      .findById(exchange.productId)
      .catch(err => {
        throw new AppResponse({code: 400, message: 'Product not found'});
      });

    if (product.storeId !== currentUser.id) {
      throw new AppResponse({code: 400, message: 'QRcode invalid with store'});
    }
    await this.exchangeHistoryRepository.updateById(exchange.id, {
      received: true,
      updatedAt: new Date(),
    });
    return new AppResponse({
      data: {
        userInfo: new RespUserInfoModel(user),
        product: new RespProductModel(product, store),
      },
    });
  }
}
