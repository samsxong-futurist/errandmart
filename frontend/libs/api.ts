import type { Product } from "./types";

export interface AdminOverviewProduct {
  id: string;
  product_name: string;
  price: number;
  image_url: string | null;
  sku: string | null;
  category: string | null;
  updated_at: string;
  is_active: boolean;
}

export interface AdminOverviewRun {
  id: string;
  file_name: string | null;
  rows_created: number;
  rows_updated: number;
  rows_total: number;
  created_at: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const body = (await response.json()) as T | { error?: string };
  if (!response.ok) {
    throw new Error(typeof body === "object" && body && "error" in body ? body.error : "Request failed");
  }
  return body as T;
}

export function searchProducts(input: { query: string; category: string; limit: number }) {
  const params = new URLSearchParams({
    query: input.query,
    category: input.category,
    limit: String(input.limit),
  });
  return request<Product[]>(`/api/products?${params}`);
}

export function listCategories() {
  return request<string[]>("/api/categories");
}

export function adminOverview(passcode: string) {
  return request<{ products: AdminOverviewProduct[]; runs: AdminOverviewRun[] }>("/api/admin/overview", {
    method: "POST",
    body: JSON.stringify({ passcode }),
  });
}

export function importProducts(data: {
  passcode: string;
  fileName: string;
  rows: unknown[];
  deactivateMissing: boolean;
}) {
  return request<{ created: number; updated: number; skipped: number }>("/api/admin/import", {
    method: "POST",
    body: JSON.stringify(data),
  });
}