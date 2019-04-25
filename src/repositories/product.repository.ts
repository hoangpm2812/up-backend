import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {Product} from '../models/db.models';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Product, dataSource);
  }
}
