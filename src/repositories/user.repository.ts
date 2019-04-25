import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources/mongo.datasource';
import {inject} from '@loopback/core';
import {UserStepHistoryRepository} from './user-step-history.repository';
import {UserRefillHistoryRepository} from './user-refill-history.repository';
import {
  User,
  UserStepHistory,
  UserRefillHistory,
  UserExchangeHistory,
} from '../models/db.models';
import {UserExchangeHistoryRepository} from './user-exchange-history.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  public stepHistory: HasManyRepositoryFactory<
    UserStepHistory,
    typeof User.prototype.id
  >;

  public refillHistory: HasManyRepositoryFactory<
    UserRefillHistory,
    typeof User.prototype.id
  >;

  public exchangeHistory: HasManyRepositoryFactory<
    UserExchangeHistory,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(UserStepHistoryRepository)
    userStepHistoryRepository: UserStepHistoryRepository,
    @repository(UserRefillHistoryRepository)
    userRefillHistoryRepository: UserRefillHistoryRepository,
    @repository(UserExchangeHistoryRepository)
    userExchangeHistoryRepository: UserExchangeHistoryRepository,
  ) {
    super(User, dataSource);
    this.stepHistory = this.createHasManyRepositoryFactoryFor(
      'stepHistory',
      async () => userStepHistoryRepository,
    );
    this.refillHistory = this.createHasManyRepositoryFactoryFor(
      'refillHistory',
      async () => userRefillHistoryRepository,
    );
    this.exchangeHistory = this.createHasManyRepositoryFactoryFor(
      'exchangeHistory',
      async () => userExchangeHistoryRepository,
    );
  }
}
