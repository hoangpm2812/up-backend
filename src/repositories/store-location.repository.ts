import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {StoreLocation} from '../models/db.models';

export class StoreLocationRepository extends DefaultCrudRepository<
  StoreLocation,
  typeof StoreLocation.prototype.id
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(StoreLocation, dataSource);
  }
}
