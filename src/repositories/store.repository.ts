import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {ProductRepository} from './product.repository';
import {Store, Product, StoreLocation} from '../models/db.models';
import {StoreLocationRepository} from './store-location.repository';

export class StoreRepository extends DefaultCrudRepository<
  Store,
  typeof Store.prototype.id
> {
  public locations: HasManyRepositoryFactory<
    StoreLocation,
    typeof StoreLocation.prototype.id
  >;
  public products: HasManyRepositoryFactory<Product, typeof Store.prototype.id>;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(StoreLocationRepository)
    storeLocationRepository: StoreLocationRepository,
    @repository(ProductRepository) productRepository: ProductRepository,
  ) {
    super(Store, dataSource);
    this.locations = this.createHasManyRepositoryFactoryFor(
      'locations',
      async () => storeLocationRepository,
    );
    this.products = this.createHasManyRepositoryFactoryFor(
      'products',
      async () => productRepository,
    );
  }
}
