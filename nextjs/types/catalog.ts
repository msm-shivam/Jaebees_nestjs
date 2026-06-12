export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out of stock';
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
}
