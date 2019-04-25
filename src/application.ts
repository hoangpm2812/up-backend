import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RestBindings} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {MySequence} from './sequence';
import {AuthenticationComponent} from '@loopback/authentication/dist/authentication.component';
import {AuthenticationBindings} from '@loopback/authentication/dist/keys';
import {AuthenticateActionProvider} from './authentication/providers/custom.authentication.provider';
import {StrategyResolverProvider} from './authentication/providers/strategy.resolver.provider';
import {
  JWTAuthenticationBindings,
  PasswordHasherBindings,
} from './authentication/keys';
import {JWTStrategy} from './authentication/authentication-strategies/JWT.strategy';
import {
  JWT_SECRET,
  JWTAuthenticationService,
} from './authentication/services/JWT.authentication.service';
import {BcryptHasher} from './authentication/services/hash.password.bcryptjs';

export class StepRewardApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.bind(AuthenticationBindings.AUTH_ACTION).toProvider(
      AuthenticateActionProvider,
    );
    this.bind(AuthenticationBindings.STRATEGY).toProvider(
      StrategyResolverProvider,
    );

    // Bind JWT authentication strategy related elements
    this.bind(JWTAuthenticationBindings.STRATEGY).toClass(JWTStrategy);
    this.bind(JWTAuthenticationBindings.SECRET).to(JWT_SECRET);
    this.bind(JWTAuthenticationBindings.SERVICE).toClass(
      JWTAuthenticationService,
    );

    // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);

    // Limit request size
    this.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({limit: '1MB'});

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
