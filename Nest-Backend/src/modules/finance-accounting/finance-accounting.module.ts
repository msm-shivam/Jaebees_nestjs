import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { Settlement } from './entities/settlement.entity';
import { TaxRecord } from './entities/tax-record.entity';
import { ExpenseRecord } from './entities/expense-record.entity';
import { FinancialAudit } from './entities/financial-audit.entity';
import { Order } from '../orders/entities/order.entity';
import { FinanceService } from './services/finance.service';
import { LedgerService } from './services/ledger.service';
import { SettlementService } from './services/settlement.service';
import { TaxService } from './services/tax.service';
import { ExpenseService } from './services/expense.service';
import { FinancialReportService } from './services/financial-report.service';
import { AdminFinanceController } from './controllers/admin-finance.controller';
import { AdminSettlementController } from './controllers/admin-settlement.controller';
import { AdminExpenseController } from './controllers/admin-expense.controller';
import { AdminTaxController } from './controllers/admin-tax.controller';
import { AdminFinancialReportsController } from './controllers/admin-financial-reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialTransaction,
      LedgerEntry,
      Settlement,
      TaxRecord,
      ExpenseRecord,
      FinancialAudit,
      Order,
    ]),
  ],
  controllers: [
    AdminFinanceController,
    AdminSettlementController,
    AdminExpenseController,
    AdminTaxController,
    AdminFinancialReportsController,
  ],
  providers: [
    FinanceService,
    LedgerService,
    SettlementService,
    TaxService,
    ExpenseService,
    FinancialReportService,
  ],
  exports: [
    FinanceService,
    LedgerService,
    TaxService,
  ],
})
export class FinanceAccountingModule {}
