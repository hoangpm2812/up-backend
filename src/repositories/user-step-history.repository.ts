import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {UserStepHistory} from '../models/db.models';

export class UserStepHistoryRepository extends DefaultCrudRepository<
  UserStepHistory,
  typeof UserStepHistory.prototype.id
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(UserStepHistory, dataSource);
  }
}
