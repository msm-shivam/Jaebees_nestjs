import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { DiscoveryService } from '../services/discovery.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ProductResponseDto } from '../../../modules/products/dto/product-response.dto';

@ApiTags('Discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  private mapProducts(products: any[]) {
    return products.map((p) =>
      plainToInstance(
        ProductResponseDto,
        { ...p, brandName: p.brand?.name ?? '', categoryName: p.category?.name ?? '' },
        { excludeExtraneousValues: true },
      ),
    );
  }

  @Get('related/:productId')
  @ApiOperation({ summary: 'Get related products' })
  async related(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.mapProducts(
      await this.discoveryService.getRelatedProducts(productId, limit),
    );
  }

  @Get('also-viewed/:productId')
  @ApiOperation({ summary: 'Get customers also viewed' })
  async alsoViewed(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.mapProducts(
      await this.discoveryService.getAlsoViewed(productId, limit),
    );
  }

  @Get('frequently-bought/:productId')
  @ApiOperation({ summary: 'Get frequently bought together' })
  async frequentlyBought(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.mapProducts(
      await this.discoveryService.getFrequentlyBought(productId, limit),
    );
  }

  @Get('trending-products')
  @Get('trending')
  @ApiOperation({ summary: 'Get trending products' })
  async trendingProducts(@Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getTrendingProducts(limit),
    );
  }

  @Get('featured-products')
  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  async featuredProducts(@Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getFeaturedProducts(limit),
    );
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Get new arrivals' })
  async newArrivals(@Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getNewArrivals(limit),
    );
  }

  @Get('recently-viewed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recently viewed products (customer)' })
  async recentlyViewed(@Req() req: any, @Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getRecentlyViewed(req.user.id, limit),
    );
  }

  @Get('recommended')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personalized product recommendations' })
  async recommended(@Req() req: any, @Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getRecommended(req.user.id, limit),
    );
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top-rated products' })
  async topRated(@Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getTopRated(limit),
    );
  }

  @Get('on-sale')
  @ApiOperation({ summary: 'Get products on sale (with discount)' })
  async onSale(@Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getOnSale(limit),
    );
  }

  @Get('similar/:productId')
  @Get('similar-products/:productId')
  @ApiOperation({ summary: 'Get similar products (same category + brand)' })
  async similar(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.mapProducts(
      await this.discoveryService.getSimilar(productId, limit),
    );
  }

  @Get('recent-trending')
  @ApiOperation({ summary: 'Get recently trending products (7 days)' })
  async recentTrending(@Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getRecentTrending(limit),
    );
  }

  @Get('seasonal')
  @ApiOperation({ summary: 'Get seasonal product recommendations' })
  async seasonal(@Query('limit') limit?: number) {
    return this.mapProducts(
      await this.discoveryService.getSeasonal(limit),
    );
  }

  @Get('record-view/:productId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Record a product view' })
  async recordView(@Req() req: any, @Param('productId') productId: string) {
    await this.discoveryService.recordView(req.user.id, productId);
    return { message: 'View recorded' };
  }
}
