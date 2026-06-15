import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewImage } from './entities/review-image.entity';
import { ReviewStatus } from './enums/review-status.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId, userId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Can only review delivered orders');
    }

    const orderItem = await this.orderItemRepository.findOne({
      where: {
        id: dto.orderItemId,
        orderId: dto.orderId,
        productId: dto.productId,
      },
    });
    if (!orderItem) {
      throw new NotFoundException('Order item not found in this order');
    }

    const existing = await this.reviewRepository.findOne({
      where: { orderItemId: dto.orderItemId },
    });
    if (existing) {
      throw new BadRequestException(
        'Review already exists for this order item',
      );
    }

    const review = this.reviewRepository.create({
      userId,
      productId: dto.productId,
      variantId: dto.variantId ?? null,
      orderId: dto.orderId,
      orderItemId: dto.orderItemId,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      status: ReviewStatus.PENDING,
      isVerifiedPurchase: true,
    });
    const saved = await this.reviewRepository.save(review);
    await this.recalculateProductRating(dto.productId);
    return saved;
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId, status: ReviewStatus.APPROVED },
      relations: { user: true, images: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { userId },
      relations: { product: true, images: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: { user: true, product: true, images: true },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({
      relations: { user: true, product: true, images: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.findById(id);
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }
    if (review.status === ReviewStatus.APPROVED) {
      throw new BadRequestException('Cannot edit an approved review');
    }
    const now = new Date().getTime();
    const createdAt = new Date(review.createdAt).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (now - createdAt > sevenDays) {
      throw new BadRequestException('Can only edit reviews within 7 days');
    }
    Object.assign(review, dto);
    const saved = await this.reviewRepository.save(review);
    await this.recalculateProductRating(review.productId);
    return saved;
  }

  async remove(id: string, userId?: string): Promise<void> {
    const review = await this.findById(id);
    if (userId && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviewRepository.softDelete(id);
    await this.recalculateProductRating(review.productId);
  }

  async approve(id: string, adminId: string): Promise<Review> {
    const review = await this.findById(id);
    review.status = ReviewStatus.APPROVED;
    review.approvedBy = adminId;
    review.approvedAt = new Date();
    const saved = await this.reviewRepository.save(review);
    await this.recalculateProductRating(review.productId);
    return saved;
  }

  async reject(id: string, _adminId: string): Promise<Review> {
    const review = await this.findById(id);
    review.status = ReviewStatus.REJECTED;
    const saved = await this.reviewRepository.save(review);
    await this.recalculateProductRating(review.productId);
    return saved;
  }

  async hide(id: string, adminId: string): Promise<Review> {
    const review = await this.findById(id);
    review.status = ReviewStatus.HIDDEN;
    review.approvedBy = adminId;
    review.approvedAt = new Date();
    const saved = await this.reviewRepository.save(review);
    await this.recalculateProductRating(review.productId);
    return saved;
  }

  async recalculateProductRating(productId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .addSelect('COUNT(CASE WHEN review.rating = 5 THEN 1 END)', 'fiveStar')
      .addSelect('COUNT(CASE WHEN review.rating = 4 THEN 1 END)', 'fourStar')
      .addSelect('COUNT(CASE WHEN review.rating = 3 THEN 1 END)', 'threeStar')
      .addSelect('COUNT(CASE WHEN review.rating = 2 THEN 1 END)', 'twoStar')
      .addSelect('COUNT(CASE WHEN review.rating = 1 THEN 1 END)', 'oneStar')
      .addSelect(
        'COUNT(CASE WHEN review.rating IS NOT NULL THEN 1 END)',
        'totalRatings',
      )
      .where('review.productId = :productId', { productId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.deletedAt IS NULL')
      .getRawOne();

    const avg = result?.avg ? parseFloat(parseFloat(result.avg).toFixed(2)) : 0;
    const count = result?.count ? parseInt(result.count, 10) : 0;
    const totalRatings = result?.totalRatings
      ? parseInt(result.totalRatings, 10)
      : 0;
    const fiveStar = result?.fiveStar ? parseInt(result.fiveStar, 10) : 0;
    const fourStar = result?.fourStar ? parseInt(result.fourStar, 10) : 0;
    const threeStar = result?.threeStar ? parseInt(result.threeStar, 10) : 0;
    const twoStar = result?.twoStar ? parseInt(result.twoStar, 10) : 0;
    const oneStar = result?.oneStar ? parseInt(result.oneStar, 10) : 0;

    await this.productRepository.update(productId, {
      averageRating: avg,
      totalRatings,
      totalReviews: count,
      fiveStarCount: fiveStar,
      fourStarCount: fourStar,
      threeStarCount: threeStar,
      twoStarCount: twoStar,
      oneStarCount: oneStar,
    });
  }
}
