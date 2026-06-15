export class CatalogSummaryItem {
  label: string;
  value: number;
  color?: string;
}

export class CatalogSummaryDto {
  items: CatalogSummaryItem[];
}
