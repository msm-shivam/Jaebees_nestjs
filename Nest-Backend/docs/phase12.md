# Layer 12 — Reviews, Ratings, Product Q&A & Customer Feedback System (Complete)

## Status

| Module                      | Status     |
| --------------------------- | ---------- |
| Product Reviews             | ✅ Complete |
| Product Ratings             | ✅ Complete |
| Review Images               | ✅ Complete |
| Review Moderation           | ✅ Complete |
| Review Helpful Votes        | ✅ Complete |
| Review Reports              | ✅ Complete |
| Product Questions           | ✅ Complete |
| Product Answers             | ✅ Complete |
| Customer Feedback Analytics | ✅ Complete |

---

## Phase 12 Deliverables

* Review Entity
* Review Image Entity
* Review Helpful Vote Entity
* Review Report Entity
* Product Question Entity
* Product Answer Entity
* Product rating aggregation engine
* Verified purchase validation
* Review moderation workflow
* Helpful vote tracking
* Abuse reporting system
* Product Q&A system
* Admin review management
* Admin Q&A management
* Review analytics
* Swagger documentation
* RBAC integration
* Migration
* Seed updates

---

# Review Entity

Fields

* id
* productId
* variantId
* userId
* orderId
* rating
* title
* review
* status
* isVerifiedPurchase
* helpfulCount
* adminNote
* createdAt
* updatedAt
* deletedAt

---

# Review Image Entity

Fields

* id
* reviewId
* imageUrl
* sortOrder
* createdAt

---

# Review Helpful Vote Entity

Fields

* id
* reviewId
* userId
* createdAt

Unique:

(reviewId,userId)

---

# Review Report Entity

Fields

* id
* reviewId
* userId
* reason
* notes
* createdAt

---

# Product Question Entity

Fields

* id
* productId
* userId
* question
* status
* createdAt
* updatedAt

---

# Product Answer Entity

Fields

* id
* questionId
* userId
* answer
* isAdminAnswer
* createdAt

---

# Enums

## Review Status

```ts
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN',
}
```

## Question Status

```ts
export enum QuestionStatus {
  OPEN = 'OPEN',
  ANSWERED = 'ANSWERED',
  CLOSED = 'CLOSED',
}
```

## Review Report Reason

```ts
export enum ReviewReportReason {
  SPAM = 'SPAM',
  OFFENSIVE = 'OFFENSIVE',
  FAKE_REVIEW = 'FAKE_REVIEW',
  OTHER = 'OTHER',
}
```

---

# Business Rules

## Review Creation

Customer must:

* Be authenticated
* Have purchased product
* Have delivered order
* One review per order item
* Rating required

Rating range:

```text
1 - 5
```

---

## Verified Purchase

Automatically calculated

```text
Order belongs to user
AND
Product exists in order
```

---

## Review Editing

Allowed only:

* Review owner
* Within 7 days

---

## Review Deletion

Soft delete only

---

## Review Moderation

Admin can:

* Approve
* Reject
* Hide

---

## Helpful Votes

User can vote only once.

Removing vote decreases helpfulCount.

---

## Review Reports

Customer may report review.

Reasons:

* Spam
* Offensive
* Fake Review
* Other

---

## Product Rating Aggregation

Automatically update Product:

```ts
averageRating
totalReviews
fiveStarCount
fourStarCount
threeStarCount
twoStarCount
oneStarCount
```

after:

* review create
* update
* delete
* approve
* reject

---

## Product Questions

Customer can ask questions.

Questions start as:

```text
OPEN
```

---

## Product Answers

Admin answers question.

Status automatically:

```text
ANSWERED
```

---

# Product Updates

Add columns

```ts
averageRating
totalReviews
fiveStarCount
fourStarCount
threeStarCount
twoStarCount
oneStarCount
```

---

# Permissions

## Reviews

```text
review.create
review.view
review.update
review.delete
review.moderate
```

## Questions

```text
question.view
question.answer
question.delete
```

---

# API Endpoints

## Customer Reviews

Base:

/api/v1/reviews

POST /reviews

GET /reviews/product/:productId

GET /reviews/:id

PATCH /reviews/:id

DELETE /reviews/:id

POST /reviews/:id/helpful

DELETE /reviews/:id/helpful

POST /reviews/:id/report

---

## Customer Questions

Base:

/api/v1/questions

POST /questions

GET /questions/product/:productId

GET /questions/:id

---

## Admin Reviews

Base:

/api/v1/admin/reviews

GET /admin/reviews

GET /admin/reviews/:id

PATCH /admin/reviews/:id/approve

PATCH /admin/reviews/:id/reject

PATCH /admin/reviews/:id/hide

---

## Admin Questions

Base:

/api/v1/admin/questions

GET /admin/questions

GET /admin/questions/:id

POST /admin/questions/:id/answer

PATCH /admin/questions/:id/close

DELETE /admin/questions/:id

---

# Database Tables

## reviews

* id
* product_id
* variant_id
* user_id
* order_id
* rating
* title
* review
* status
* helpful_count
* is_verified_purchase
* admin_note
* created_at
* updated_at
* deleted_at

---

## review_images

* id
* review_id
* image_url
* sort_order
* created_at

---

## review_helpful_votes

* id
* review_id
* user_id
* created_at

Unique:

(review_id,user_id)

---

## review_reports

* id
* review_id
* user_id
* reason
* notes
* created_at

---

## product_questions

* id
* product_id
* user_id
* question
* status
* created_at
* updated_at

---

## product_answers

* id
* question_id
* user_id
* answer
* is_admin_answer
* created_at

---

# Migration

Phase12ReviewsRatingsAndQA.ts

Creates:

* reviews
* review_images
* review_helpful_votes
* review_reports
* product_questions
* product_answers

Updates:

products table

Adds:

* average_rating
* total_reviews
* five_star_count
* four_star_count
* three_star_count
* two_star_count
* one_star_count

---

# Analytics

Endpoints

GET /admin/reviews/analytics

Returns:

* totalReviews
* approvedReviews
* pendingReviews
* rejectedReviews
* averageRating
* ratingDistribution
* mostReviewedProducts
* mostHelpfulReviews

---

# Seed Updates

Permissions

review.create

review.view

review.update

review.delete

review.moderate

question.view

question.answer

question.delete

Role Mapping

SUPER_ADMIN

PRODUCT_MANAGER

SUPPORT_MANAGER

---

# Swagger

Document

* Review CRUD
* Helpful Votes
* Review Reports
* Moderation
* Product Questions
* Product Answers
* Analytics

---

# Success Criteria

* Customer reviews purchased products
* Verified purchase works
* Rating aggregation works
* Helpful voting works
* Review reporting works
* Product Q&A works
* Admin moderation works
* Analytics work
* Swagger complete
* RBAC complete
* Migration successful
* Zero TypeScript errors
