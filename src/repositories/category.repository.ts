import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {Category, Product} from '../models/db.models';
import {ProductRepository} from './product.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id
> {
  public products: HasManyRepositoryFactory<
    Product,
    typeof Category.prototype.id
  >;
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ProductRepository) productRepository: ProductRepository,
  ) {
    super(Category, dataSource);
    this.products = this.createHasManyRepositoryFactoryFor(
      'products',
      async () => productRepository,
    );
    this.startUp();
  }

  static isStartup = true;
  static categories = ['drink', 'food', 'pie', 'ticket', 'other'];

  private async startUp() {
    if (CategoryRepository.isStartup) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < CategoryRepository.categories.length; i++) {
        const category = await this.findOne({
          where: {name: CategoryRepository.categories[i]},
        });
        if (!category) {
          await this.create(
            new Category({name: CategoryRepository.categories[i]}),
          );
        }
      }
      CategoryRepository.isStartup = false;
    }
  }
}
