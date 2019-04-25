import * as _ from 'lodash';
import {UserRepository} from '../../repositories/user.repository';
import {toJSON} from '@loopback/testlab';
import {promisify} from 'util';
import {repository} from '@loopback/repository';
import {inject} from '@loopback/core';
import {JWTAuthenticationBindings, PasswordHasherBindings} from '../keys';
import {PasswordHasher} from './hash.password.bcryptjs';
import {AuthProfile, Role, Credentials} from '../types';
import {StoreRepository} from '../../repositories/store.repository';
import {AppResponse} from '../../models/ctrl.models';
import {Constant} from '../../controllers/common';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export const JWT_SECRET = 'jwtsecret';

export class JWTAuthenticationService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(StoreRepository) public storeRepository: StoreRepository,
    @inject(JWTAuthenticationBindings.SECRET) public jwt_secret: string,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async getAccessTokenForAcount(
    credentials: Credentials,
    role: string,
  ): Promise<string> {
    let foundAccount = null;
    switch (role) {
      case Role.user:
        foundAccount = await this.userRepository.findOne({
          where: {email: credentials.email},
        });
        break;
      case Role.store:
        foundAccount = await this.storeRepository.findOne({
          where: {email: credentials.email},
        });
        break;
    }

    if (!foundAccount) {
      throw new AppResponse({code: 401, message: 'Wrong account'});
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      foundAccount.password,
    );

    if (!passwordMatched) {
      throw new AppResponse({code: 401, message: 'Wrong account'});
    }

    let currAccount = _.pick(toJSON(foundAccount), ['id', 'email', 'name']);
    (currAccount as AuthProfile).role = role;

    // Generate user token using JWT
    const token = await signAsync(currAccount, this.jwt_secret, {
      expiresIn: Constant.TOKEN_EXPIRES,
    });

    return token;
  }

  async decodeAccessToken(token: string): Promise<AuthProfile> {
    const decoded = await verifyAsync(token, this.jwt_secret);
    let user = _.pick(decoded, ['id', 'email', 'name', 'role']);
    return user;
  }
}
