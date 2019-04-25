import {Getter, Provider, Setter, inject} from '@loopback/context';
import {Request} from '@loopback/rest';
import {AuthenticationBindings} from '@loopback/authentication';
import {AuthenticationStrategy} from '../authentication-strategies/authentication.strategy';
import {AuthProfile, AuthenticateFn} from '../types';

export class AuthenticateActionProvider implements Provider<AuthenticateFn> {
  constructor(
    @inject.getter(AuthenticationBindings.STRATEGY)
    readonly getStrategy: Getter<AuthenticationStrategy>,
    @inject.setter(AuthenticationBindings.CURRENT_USER)
    readonly setCurrentUser: Setter<AuthProfile>,
  ) {}

  value(): AuthenticateFn {
    return request => this.action(request);
  }

  async action(request: Request): Promise<AuthProfile | undefined> {
    const strategy = await this.getStrategy();
    if (!strategy) {
      // The invoked operation does not require authentication.
      return undefined;
    }
    if (!strategy.authenticate) {
      throw new Error('invalid strategy parameter');
    }
    const user = await strategy.authenticate(request);
    if (user) this.setCurrentUser(user);
    return user;
  }
}
