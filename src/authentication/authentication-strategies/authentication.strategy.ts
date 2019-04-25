import {Request} from '@loopback/rest';
import {AuthProfile} from '../types';

export interface AuthenticationStrategy {
  authenticate(request: Request): Promise<AuthProfile | undefined>;
}
