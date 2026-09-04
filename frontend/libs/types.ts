/** Internal product shape — decoupled from any inventory system's schema. */
export interface Product {
  id: string;
  product_name: string;
  price: number;
  image_url: string | null;
  sku: string | null;
  category: string | null;
  updated_at: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface ImportRun {
  id: string;
  file_name: string | null;
  source: string;
  rows_total: number;
  rows_created: number;
  rows_updated: number;
  rows_skipped: number;
  status: string;
  error_message: string | null;
  created_at: string;
}
