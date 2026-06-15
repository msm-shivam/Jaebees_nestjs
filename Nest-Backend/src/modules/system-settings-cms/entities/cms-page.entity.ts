import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CmsPageStatus } from '../enums/cms-page-status.enum';
import { CmsPageType } from '../enums/cms-page-type.enum';

@Entity('cms_pages')
@Index(['slug'], { unique: true })
@Index(['status'])
@Index(['pageType'])
@Index(['createdAt'])
export class CmsPage extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: CmsPageStatus, default: CmsPageStatus.DRAFT })
  status: CmsPageStatus;

  @Column({
    name: 'page_type',
    type: 'enum',
    enum: CmsPageType,
    nullable: true,
  })
  pageType: CmsPageType | null;
}
