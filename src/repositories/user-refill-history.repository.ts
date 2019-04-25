import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {UserRefillHistory} from '../models/db.models';

export class UserRefillHistoryRepository extends DefaultCrudRepository<
  UserRefillHistory,
  typeof UserRefillHistory.prototype.id
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(UserRefillHistory, dataSource);
  }
}
