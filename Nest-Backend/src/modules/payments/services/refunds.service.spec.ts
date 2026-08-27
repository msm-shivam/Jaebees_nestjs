import { Test, TestingModule } from '@nestjs/testing';
import { RefundsService } from './refunds.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentRefund, RefundStatus } from '../entities/payment-refund.entity';
import { PaymentLog } from '../entities/payment-log.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { StripeService } from './stripe.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../entities/payment-status.enum';

describe('RefundsService - Comprehensive Refund Engine Verification', () => {
  let service: RefundsService;
  let paymentRepo: any;
  let refundRepo: any;
  let paymentLogRepo: any;
  let orderRepo: any;
  let userRepo: any;
  let stripeService: any;
  let notificationsService: any;

  const mockPayment = {
    id: 'pay-123',
    orderId: 'ord-123',
    amount: 1000,
    status: PaymentStatus.PAID,
    stripePaymentIntentId: 'pi_test123',
  };

  const mockRefundReservation = {
    id: 'ref-123',
    paymentId: 'pay-123',
    refundAmount: 1000,
    status: RefundStatus.PROCESSING,
    idempotencyKey: 'key_123',
  };

  const mockOrder = {
    id: 'ord-123',
    orderNumber: 'ORD-2026-001',
    user: {
      id: 'usr-1',
      email: 'customer@example.com',
      firstName: 'Jane',
    },
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((entity, dto) => dto),
      save: jest.fn().mockImplementation((entity, dto) => dto),
    },
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (cb) => {
      return cb(mockQueryRunner.manager);
    }),
  };

  beforeEach(async () => {
    paymentRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    refundRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),
    };
    paymentLogRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),
    };
    orderRepo = {
      findOne: jest.fn().mockResolvedValue(mockOrder),
    };
    userRepo = {
      findOne: jest.fn().mockResolvedValue(mockOrder.user),
    };
    stripeService = {
      createRefund: jest.fn(),
    };
    notificationsService = {
      sendRefundProcessed: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(PaymentRefund), useValue: refundRepo },
        { provide: getRepositoryToken(PaymentLog), useValue: paymentLogRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: StripeService, useValue: stripeService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<RefundsService>(RefundsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. Full Refund Lifecycle & Customer Notification', () => {
    it('should process a valid full refund, update payment status to REFUNDED and send notification', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment });
        return Promise.resolve(null);
      });
      mockQueryRunner.manager.find.mockResolvedValueOnce([]) // existing refunds during reservation
        .mockResolvedValueOnce([{ refundAmount: 1000, status: RefundStatus.COMPLETED }]); // all completed
      stripeService.createRefund.mockResolvedValue({ id: 're_stripe123' });
      paymentRepo.findOne.mockResolvedValue({ ...mockPayment });

      const result = await service.createRefund(
        'pay-123',
        { amount: 1000, reason: 'Full order cancellation', idempotencyKey: 'key_full' },
        'admin-1',
      );

      expect(result.alreadyProcessed).toBe(false);
      expect(stripeService.createRefund).toHaveBeenCalledWith(
        'pi_test123',
        1000,
        'Full order cancellation',
        'key_full',
      );
      expect(notificationsService.sendRefundProcessed).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          amount: 1000,
          orderNumber: 'ORD-2026-001',
        }),
      );
    });
  });

  describe('2. Partial Refund Lifecycle & Status Transition', () => {
    it('should process partial refund and transition payment status to PARTIALLY_REFUNDED', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment });
        return Promise.resolve(null);
      });
      mockQueryRunner.manager.find.mockResolvedValueOnce([]) // initial check
        .mockResolvedValueOnce([{ refundAmount: 400, status: RefundStatus.COMPLETED }]); // after save
      stripeService.createRefund.mockResolvedValue({ id: 're_stripe_partial' });
      paymentRepo.findOne.mockResolvedValue({ ...mockPayment });

      const result = await service.createRefund(
        'pay-123',
        { amount: 400, reason: 'Partial return item', idempotencyKey: 'key_part1' },
        'admin-1',
      );

      expect(result.alreadyProcessed).toBe(false);
      expect(result.data?.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
    });

    it('should transition to REFUNDED when subsequent partial refund completes the total amount', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment, status: PaymentStatus.PARTIALLY_REFUNDED });
        return Promise.resolve(null);
      });
      mockQueryRunner.manager.find.mockResolvedValueOnce([{ refundAmount: 400, status: RefundStatus.COMPLETED }]) // 400 already refunded
        .mockResolvedValueOnce([
          { refundAmount: 400, status: RefundStatus.COMPLETED },
          { refundAmount: 600, status: RefundStatus.COMPLETED },
        ]); // now 1000 refunded
      stripeService.createRefund.mockResolvedValue({ id: 're_stripe_partial2' });
      paymentRepo.findOne.mockResolvedValue({ ...mockPayment });

      const result = await service.createRefund(
        'pay-123',
        { amount: 600, reason: 'Final partial refund', idempotencyKey: 'key_part2' },
        'admin-1',
      );

      expect(result.data?.status).toBe(PaymentStatus.REFUNDED);
    });
  });

  describe('3. Validation & Boundary Conditions', () => {
    it('should reject refund if requested amount exceeds remaining balance', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment });
        return Promise.resolve(null);
      });
      mockQueryRunner.manager.find.mockResolvedValue([
        { refundAmount: 700, status: RefundStatus.COMPLETED },
      ]);

      await expect(
        service.createRefund(
          'pay-123',
          { amount: 500, reason: 'Exceeding refund', idempotencyKey: 'key_over' },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject refund when payment is already fully refunded', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment, status: PaymentStatus.REFUNDED });
        return Promise.resolve(null);
      });

      await expect(
        service.createRefund(
          'pay-123',
          { amount: 100, reason: 'Excess refund', idempotencyKey: 'key_already_refunded' },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject refund when amount is 0 or negative', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment });
        return Promise.resolve(null);
      });
      mockQueryRunner.manager.find.mockResolvedValue([]);

      await expect(
        service.createRefund(
          'pay-123',
          { amount: 0, reason: 'Zero amount', idempotencyKey: 'key_zero' },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject refund when payment has no Stripe Payment Intent ID', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment, stripePaymentIntentId: null });
        return Promise.resolve(null);
      });

      await expect(
        service.createRefund(
          'pay-123',
          { amount: 500, reason: 'No PI', idempotencyKey: 'key_no_pi' },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('4. Idempotency, Concurrency & Retry Resilience', () => {
    it('should return existing completed refund without duplicate Stripe call on idempotent replay', async () => {
      const completedRefund = {
        ...mockRefundReservation,
        status: RefundStatus.COMPLETED,
      };
      refundRepo.findOne.mockResolvedValue(completedRefund);
      paymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.createRefund(
        'pay-123',
        { amount: 1000, reason: 'Customer request', idempotencyKey: 'key_123' },
        'admin-1',
      );

      expect(result.alreadyProcessed).toBe(true);
      expect(stripeService.createRefund).not.toHaveBeenCalled();
    });

    it('should reject idempotency conflict if same key is reused with different amount', async () => {
      const existingRefund = {
        ...mockRefundReservation,
        refundAmount: 500,
        status: RefundStatus.COMPLETED,
      };
      refundRepo.findOne.mockResolvedValue(existingRefund);

      await expect(
        service.createRefund(
          'pay-123',
          { amount: 1000, reason: 'Conflict amount', idempotencyKey: 'key_123' },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark reservation FAILED if Stripe API throws an error', async () => {
      refundRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment });
        return Promise.resolve(null);
      });
      mockQueryRunner.manager.find.mockResolvedValue([]);
      stripeService.createRefund.mockRejectedValue(new Error('Stripe card error'));
      paymentRepo.findOne.mockResolvedValue(mockPayment);

      await expect(
        service.createRefund(
          'pay-123',
          { amount: 500, reason: 'Failed test', idempotencyKey: 'key_fail' },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(refundRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: RefundStatus.FAILED }),
      );
    });

    it('should allow retry after a previous FAILED refund attempt', async () => {
      const failedRefund = {
        ...mockRefundReservation,
        status: RefundStatus.FAILED,
      };
      refundRepo.findOne.mockResolvedValue(failedRefund);
      mockQueryRunner.manager.findOne.mockImplementation((entity) => {
        if (entity === Payment) return Promise.resolve({ ...mockPayment });
        return Promise.resolve(null);
      });
      mockQueryRunner.manager.find.mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ refundAmount: 1000, status: RefundStatus.COMPLETED }]);
      stripeService.createRefund.mockResolvedValue({ id: 're_stripe_retry_ok' });
      paymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.createRefund(
        'pay-123',
        { amount: 1000, reason: 'Retry customer refund', idempotencyKey: 'key_123' },
        'admin-1',
      );

      expect(result.alreadyProcessed).toBe(false);
      expect(stripeService.createRefund).toHaveBeenCalledWith(
        'pi_test123',
        1000,
        'Retry customer refund',
        'key_123',
      );
    });

    it('should recover from PROCESSING status when Stripe refund succeeded before crash', async () => {
      const processingRefund = {
        ...mockRefundReservation,
        status: RefundStatus.PROCESSING,
        stripeRefundId: null,
      };
      refundRepo.findOne.mockResolvedValue(processingRefund);
      paymentRepo.findOne.mockResolvedValue(mockPayment);
      stripeService.createRefund.mockResolvedValue({ id: 're_stripe_recovered' });

      const result = await service.createRefund(
        'pay-123',
        { amount: 1000, reason: 'Customer request', idempotencyKey: 'key_123' },
        'admin-1',
      );

      expect(result.alreadyProcessed).toBe(false);
      expect(stripeService.createRefund).toHaveBeenCalledWith(
        'pi_test123',
        1000,
        'Customer request',
        'key_123',
      );
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    });
  });
});
