import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {UserExchangeHistory} from '../models/db.models';

export class UserExchangeHistoryRepository extends DefaultCrudRepository<
  UserExchangeHistory,
  typeof UserExchangeHistory.prototype.id
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(UserExchangeHistory, dataSource);
  }
}
