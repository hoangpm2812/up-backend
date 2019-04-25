import {JWTAuthenticationBindings} from '../keys';
import {Request, HttpErrors} from '@loopback/rest';
import {AuthenticationStrategy} from './authentication.strategy';
import {inject} from '@loopback/core';
import {JWTAuthenticationService} from '../services/JWT.authentication.service';
import {UserRepository} from '../../repositories';
import {repository} from '@loopback/repository';
import {AuthProfile} from '../types';
import {AppResponse} from '../../models/ctrl.models';

export class JWTStrategy implements AuthenticationStrategy {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(JWTAuthenticationBindings.SERVICE)
    public jwtAuthenticationService: JWTAuthenticationService,
    @inject(JWTAuthenticationBindings.SECRET)
    public jwt_secret: string,
  ) {}
  async authenticate(request: Request): Promise<AuthProfile | undefined> {
    let token = request.query.access_token || request.headers['authorization'];
    if (!token) throw new HttpErrors.Unauthorized('No access token found!');

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    try {
      // validate token
      const user = await this.jwtAuthenticationService.decodeAccessToken(token);
      // validate user, store
      if (
        (user.role === 'user' && request.url.startsWith('/api/user')) ||
        (user.role === 'store' && request.url.startsWith('/api/store'))
      ) {
        return user;
      } else {
        throw new AppResponse({code: 401});
      }
    } catch (err) {
      throw new AppResponse({code: 401});
    }
  }
}
