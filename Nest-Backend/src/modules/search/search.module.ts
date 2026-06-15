import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { SubCategory } from '../sub-categories/entities/sub-category.entity';
import { Collection } from '../collections/entities/collection.entity';
import { ProductCollection } from '../collections/entities/product-collection.entity';
import { ProductVariantAttribute } from '../product-variants/entities/product-variant-attribute.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attribute-values/entities/attribute-value.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { WishlistItem } from '../wishlist/entities/wishlist-item.entity';
import { Review } from '../reviews/entities/review.entity';
import { SearchLog } from './entities/search-log.entity';
import { RecentSearch } from './entities/recent-search.entity';
import { ProductView } from './entities/product-view.entity';
import { SearchService } from './services/search.service';
import { SearchSuggestionsService } from './services/search-suggestions.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { DiscoveryService } from './services/discovery.service';
import { SearchController } from './controllers/search.controller';
import { DiscoveryController } from './controllers/discovery.controller';
import { AdminSearchController } from './controllers/admin-search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      Inventory,
      Brand,
      Category,
      SubCategory,
      Collection,
      ProductCollection,
      ProductVariantAttribute,
      Attribute,
      AttributeValue,
      OrderItem,
      WishlistItem,
      Review,
      SearchLog,
      RecentSearch,
      ProductView,
    ]),
  ],
  controllers: [SearchController, DiscoveryController, AdminSearchController],
  providers: [
    SearchService,
    SearchSuggestionsService,
    SearchAnalyticsService,
    DiscoveryService,
  ],
  exports: [DiscoveryService, SearchAnalyticsService],
})
export class SearchModule {}
