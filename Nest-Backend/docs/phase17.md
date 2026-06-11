# Layer 17 — Returns (RMA), Reverse Logistics & Refund Management

### Status: ⏳ Planned

---

## Module Build Log

| Module | Status | Started | Completed |
|----------|----------|----------|----------|
| Return Request Management (RMA) | ⏳ Pending | - | - |
| Return Approval Workflow | ⏳ Pending | - | - |
| Reverse Logistics Tracking | ⏳ Pending | - | - |
| Return Inventory Processing | ⏳ Pending | - | - |
| Refund Processing Integration | ⏳ Pending | - | - |
| Return Analytics | ⏳ Pending | - | - |
| Migration Phase17ReturnsAndRMA | ⏳ Pending | - | - |

---

# New Entities (5 Tables)

## ReturnRequest

| Field | Type |
|---------|---------|
| id | uuid |
| returnNumber | unique |
| orderId | FK |
| userId | FK |
| status | REQUESTED / APPROVED / REJECTED / PICKUP_SCHEDULED / IN_TRANSIT / RECEIVED / REFUNDED / COMPLETED |
| reason | WRONG_SIZE / DAMAGED / DEFECTIVE / WRONG_ITEM / QUALITY_ISSUE / OTHER |
| notes | text |
| totalRefundAmount | decimal |
| requestedAt | datetime |
| approvedAt | datetime |
| completedAt | datetime |

---

## ReturnItem

| Field | Type |
|---------|---------|
| id | uuid |
| returnRequestId | FK |
| orderItemId | FK |
| quantity | number |
| reason | text |
| condition | UNOPENED / OPENED / DAMAGED |
| refundAmount | decimal |

---

## ReverseShipment

| Field | Type |
|---------|---------|
| id | uuid |
| returnRequestId | FK |
| courierName | string |
| trackingNumber | string |
| status | PENDING / PICKED_UP / IN_TRANSIT / DELIVERED |
| pickupDate | datetime |
| deliveredDate | datetime |

---

## ReturnAudit

| Field | Type |
|---------|---------|
| id | uuid |
| returnRequestId | FK |
| action | string |
| performedBy | FK |
| notes | text |

---

## ReturnReasonMaster

| Field | Type |
|---------|---------|
| id | uuid |
| code | unique |
| title | string |
| isActive | boolean |

---

# API Endpoints

## Customer Returns

### `/api/v1/returns`

| Method | Path | Auth | Status |
|----------|----------|----------|----------|
| POST | /returns | Customer JWT | ✅ |
| GET | /returns/my | Customer JWT | ✅ |
| GET | /returns/:id | Customer JWT | ✅ |
| DELETE | /returns/:id | Customer JWT | ✅ |

---

## Admin Returns

### `/api/v1/admin/returns`

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| GET | /admin/returns | return.view | ✅ |
| GET | /admin/returns/:id | return.view | ✅ |
| POST | /admin/returns/:id/approve | return.approve | ✅ |
| POST | /admin/returns/:id/reject | return.reject | ✅ |
| POST | /admin/returns/:id/schedule-pickup | return.approve | ✅ |
| POST | /admin/returns/:id/received | return.receive | ✅ |
| POST | /admin/returns/:id/refund | return.refund | ✅ |
| POST | /admin/returns/:id/complete | return.approve | ✅ |

---

## Return Analytics

### `/api/v1/admin/return-analytics`

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| GET | /admin/return-analytics/summary | return.view | ✅ |
| GET | /admin/return-analytics/reasons | return.view | ✅ |
| GET | /admin/return-analytics/products | return.view | ✅ |
| GET | /admin/return-analytics/refunds | return.view | ✅ |

---

# New Permissions

| Permission | Slug |
|------------|------------|
| View Returns | `return.view` |
| Approve Returns | `return.approve` |
| Reject Returns | `return.reject` |
| Receive Returns | `return.receive` |
| Refund Returns | `return.refund` |

---

# Business Rules Implemented

| Rule | Description |
|--------|--------|
| Login Required | Customer must be authenticated |
| Order Ownership | Order must belong to logged-in customer |
| Delivered Only | Only DELIVERED orders eligible |
| 24 Hour Window | Return request allowed only within 24 hours after delivery |
| One Active Return | One active return request per order item |
| Quantity Validation | Returned quantity cannot exceed purchased quantity |
| Refund After Receive | Refund only processed after warehouse receives item |
| Inventory Restock | Returned quantity added back to inventory |
| Inventory Audit | InventoryAudit entry created automatically |
| Reverse Logistics Tracking | Courier tracking maintained |
| Auto Return Number | RMA-YYYY-000001 format |
| Soft Delete | Customer can cancel only REQUESTED returns |
| Refund Integration | Uses existing RefundsService |
| Email Notifications | Request created, approved, rejected, refunded |
| Stock Alert Recheck | Inventory alerts recalculated after return |

---

# Return Status Workflow

```text
REQUESTED
    ↓
APPROVED
    ↓
PICKUP_SCHEDULED
    ↓
IN_TRANSIT
    ↓
RECEIVED
    ↓
REFUNDED
    ↓
COMPLETED
```

---

# Reverse Logistics Workflow

```text
Customer Creates Return
        ↓
Admin Approves
        ↓
Pickup Scheduled
        ↓
Courier Pickup
        ↓
Warehouse Receives Item
        ↓
Inventory Updated
        ↓
Refund Processed
        ↓
Return Closed
```

---

# Analytics Metrics

### Summary

- Total Returns
- Total Refund Amount
- Return Rate %
- Average Return Processing Time
- Pending Returns
- Approved Returns
- Rejected Returns
- Refunded Returns

### Product Analysis

- Most Returned Products
- Most Returned Categories
- Most Returned Brands

### Reason Analysis

- Wrong Size
- Damaged Product
- Defective Product
- Wrong Item
- Quality Issue
- Other

### Financial Analysis

- Total Refund Value
- Refund By Month
- Refund By Product
- Refund By Category

---

# Deliverables

- [ ] ReturnRequest Entity
- [ ] ReturnItem Entity
- [ ] ReverseShipment Entity
- [ ] ReturnAudit Entity
- [ ] ReturnReasonMaster Entity
- [ ] ReturnService
- [ ] ReverseLogisticsService
- [ ] ReturnAnalyticsService
- [ ] CustomerReturnController
- [ ] AdminReturnController
- [ ] AdminReturnAnalyticsController
- [ ] ReturnModule
- [ ] Migration Phase17ReturnsAndRMA
- [ ] Seed Permissions (return.*)
- [ ] Inventory Integration
- [ ] Refund Integration
- [ ] Email Notification Integration
- [ ] Audit Log Integration
- [ ] app.module.ts wiring
- [ ] data-source.ts wiring
- [ ] Swagger Documentation
- [ ] Zero TypeScript Build Errors

---

### Dependencies

- Layer 6 Orders
- Layer 7 Payments
- Layer 13 Email Notifications
- Layer 16 Inventory Intelligence

---

### Migration

`Phase17ReturnsAndRMA`

Tables Created:

1. return_requests
2. return_items
3. reverse_shipments
4. return_audits
5. return_reason_master

Indexes:

- returnNumber
- orderId
- userId
- status
- trackingNumber
- requestedAt

Foreign Keys:

- Order
- User
- OrderItem
- Admin User

---