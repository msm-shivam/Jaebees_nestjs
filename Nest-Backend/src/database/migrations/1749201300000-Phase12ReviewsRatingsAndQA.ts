import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableColumn,
} from 'typeorm';

export class Phase12ReviewsRatingsAndQA1749201300000 implements MigrationInterface {
  name = 'Phase12ReviewsRatingsAndQA1749201300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns to reviews
    await queryRunner.addColumn(
      'reviews',
      new TableColumn({
        name: 'variant_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'reviews',
      new TableColumn({
        name: 'admin_note',
        type: 'text',
        isNullable: true,
      }),
    );

    // Create review_helpful_votes
    await queryRunner.createTable(
      new Table({
        name: 'review_helpful_votes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'review_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Create review_reports
    await queryRunner.createTable(
      new Table({
        name: 'review_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'review_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          {
            name: 'reason',
            type: 'enum',
            enum: ['SPAM', 'OFFENSIVE', 'FAKE_REVIEW', 'OTHER'],
          },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Create product_questions
    await queryRunner.createTable(
      new Table({
        name: 'product_questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'product_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'question', type: 'text' },
          {
            name: 'status',
            type: 'enum',
            enum: ['OPEN', 'ANSWERED', 'CLOSED'],
            default: `'OPEN'`,
          },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Create product_answers
    await queryRunner.createTable(
      new Table({
        name: 'product_answers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'question_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'answer', type: 'text' },
          { name: 'is_admin_answer', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Indexes for review_helpful_votes
    await queryRunner.createIndex(
      'review_helpful_votes',
      new TableIndex({
        name: 'idx_helpful_votes_review',
        columnNames: ['review_id'],
      }),
    );
    await queryRunner.createIndex(
      'review_helpful_votes',
      new TableIndex({
        name: 'idx_helpful_votes_user',
        columnNames: ['user_id'],
      }),
    );

    // Unique constraint on review_helpful_votes
    await queryRunner.query(
      `ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "uq_review_helpful_votes_review_user" UNIQUE ("review_id", "user_id")`,
    );

    // Indexes for review_reports
    await queryRunner.createIndex(
      'review_reports',
      new TableIndex({
        name: 'idx_review_reports_review',
        columnNames: ['review_id'],
      }),
    );
    await queryRunner.createIndex(
      'review_reports',
      new TableIndex({
        name: 'idx_review_reports_user',
        columnNames: ['user_id'],
      }),
    );

    // Indexes for product_questions
    await queryRunner.createIndex(
      'product_questions',
      new TableIndex({
        name: 'idx_questions_product',
        columnNames: ['product_id'],
      }),
    );
    await queryRunner.createIndex(
      'product_questions',
      new TableIndex({
        name: 'idx_questions_user',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'product_questions',
      new TableIndex({
        name: 'idx_questions_status',
        columnNames: ['status'],
      }),
    );

    // Index for product_answers
    await queryRunner.createIndex(
      'product_answers',
      new TableIndex({
        name: 'idx_answers_question',
        columnNames: ['question_id'],
      }),
    );

    // Foreign keys for review_helpful_votes
    await queryRunner.createForeignKey(
      'review_helpful_votes',
      new TableForeignKey({
        name: 'fk_helpful_votes_review',
        columnNames: ['review_id'],
        referencedTableName: 'reviews',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'review_helpful_votes',
      new TableForeignKey({
        name: 'fk_helpful_votes_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Foreign keys for review_reports
    await queryRunner.createForeignKey(
      'review_reports',
      new TableForeignKey({
        name: 'fk_reports_review',
        columnNames: ['review_id'],
        referencedTableName: 'reviews',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'review_reports',
      new TableForeignKey({
        name: 'fk_reports_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Foreign keys for product_questions
    await queryRunner.createForeignKey(
      'product_questions',
      new TableForeignKey({
        name: 'fk_questions_product',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'product_questions',
      new TableForeignKey({
        name: 'fk_questions_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Foreign keys for product_answers
    await queryRunner.createForeignKey(
      'product_answers',
      new TableForeignKey({
        name: 'fk_answers_question',
        columnNames: ['question_id'],
        referencedTableName: 'product_questions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'product_answers',
      new TableForeignKey({
        name: 'fk_answers_user',
        columnNames: ['user_id'],
        referencedTableName: 'admin_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key for reviews.variant_id
    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        name: 'fk_reviews_variant',
        columnNames: ['variant_id'],
        referencedTableName: 'product_variants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Add star count columns to products
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'five_star_count',
        type: 'int',
        default: 0,
      }),
    );
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'four_star_count',
        type: 'int',
        default: 0,
      }),
    );
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'three_star_count',
        type: 'int',
        default: 0,
      }),
    );
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'two_star_count',
        type: 'int',
        default: 0,
      }),
    );
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'one_star_count',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'one_star_count');
    await queryRunner.dropColumn('products', 'two_star_count');
    await queryRunner.dropColumn('products', 'three_star_count');
    await queryRunner.dropColumn('products', 'four_star_count');
    await queryRunner.dropColumn('products', 'five_star_count');
    await queryRunner.dropForeignKey('reviews', 'fk_reviews_variant');
    await queryRunner.dropForeignKey('product_answers', 'fk_answers_user');
    await queryRunner.dropForeignKey('product_answers', 'fk_answers_question');
    await queryRunner.dropForeignKey('product_questions', 'fk_questions_user');
    await queryRunner.dropForeignKey(
      'product_questions',
      'fk_questions_product',
    );
    await queryRunner.dropForeignKey('review_reports', 'fk_reports_user');
    await queryRunner.dropForeignKey('review_reports', 'fk_reports_review');
    await queryRunner.dropForeignKey(
      'review_helpful_votes',
      'fk_helpful_votes_user',
    );
    await queryRunner.dropForeignKey(
      'review_helpful_votes',
      'fk_helpful_votes_review',
    );
    await queryRunner.dropTable('product_answers');
    await queryRunner.dropTable('product_questions');
    await queryRunner.dropTable('review_reports');
    await queryRunner.dropTable('review_helpful_votes');
    await queryRunner.dropColumn('reviews', 'admin_note');
    await queryRunner.dropColumn('reviews', 'variant_id');
  }
}
