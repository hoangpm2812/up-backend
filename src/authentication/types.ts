/// <reference types="express" />
import {Request} from '@loopback/rest';
import {model, property} from '@loopback/repository';
/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface AuthenticateFn {
  (request: Request): Promise<AuthProfile | undefined>;
}

@model()
export class AuthProfile {
  @property({require: true})
  id: string;
  @property({require: true})
  name?: string;
  @property({require: true})
  email?: string;
  @property({require: true})
  role?: string;
}

@model()
export class Credentials {
  @property({require: true})
  email: string;
  @property({require: true})
  password: string;
}

export const Role = {
  user: 'user',
  store: 'store',
};
