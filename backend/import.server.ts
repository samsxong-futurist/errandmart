import { supabaseAdmin } from "./integration/supabase/client.server";

export interface ImportRowInput {
  product_name: string;
  price: number;
  image_url?: string | null | undefined;
  sku?: string | null | undefined;
  category?: string | null | undefined;
}

/**
 * Synchronisation layer: upserts by SKU when available, otherwise matches on an
 * exact product name. Never blindly appends every uploaded row.
 */
export async function runImport(input: {
  fileName?: string | undefined;
  rows: ImportRowInput[];
  deactivateMissing?: boolean | undefined;
}) {
  const { data: existing, error: readError } = await supabaseAdmin
    .from("products")
    .select("id, sku, product_name");
  if (readError) throw new Error(readError.message);

  const bySku = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const row of existing ?? []) {
    if (row.sku) bySku.set(row.sku.trim().toLowerCase(), row.id);
    byName.set(row.product_name.trim().toLowerCase(), row.id);
  }

  const seenIds = new Set<string>();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of input.rows) {
    const name = row.product_name.trim();
    if (!name) {
      skipped++;
      continue;
    }
    const sku = row.sku?.trim() || null;
    const matchId = (sku && bySku.get(sku.toLowerCase())) || byName.get(name.toLowerCase());

    const payload = {
      product_name: name,
      price: row.price,
      image_url: row.image_url?.trim() || null,
      sku,
      category: row.category?.trim() || null,
      is_active: true,
      is_sample: false,
    };

    if (matchId) {
      const { error } = await supabaseAdmin.from("products").update(payload).eq("id", matchId);
      if (error) throw new Error(error.message);
      seenIds.add(matchId);
      updated++;
    } else {
      const { data, error } = await supabaseAdmin
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      if (data) {
        seenIds.add(data.id);
        if (sku) bySku.set(sku.toLowerCase(), data.id);
        byName.set(name.toLowerCase(), data.id);
      }
      created++;
    }
  }

  let deactivated = 0;
  if (input.deactivateMissing) {
    const missing = (existing ?? []).filter((r) => !seenIds.has(r.id)).map((r) => r.id);
    if (missing.length) {
      const { error } = await supabaseAdmin
        .from("products")
        .update({ is_active: false })
        .in("id", missing);
      if (error) throw new Error(error.message);
      deactivated = missing.length;
    }
  }

  await supabaseAdmin.from("import_runs").insert({
    file_name: input.fileName ?? null,
    source: "csv",
    rows_total: input.rows.length,
    rows_created: created,
    rows_updated: updated,
    rows_skipped: skipped,
    status: "success",
  });

  return { created, updated, skipped, deactivated, total: input.rows.length };
}

export async function getOverview() {
  const [products, runs] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("id, product_name, price, image_url, sku, category, updated_at, is_active")
      .order("updated_at", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("import_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (products.error) throw new Error(products.error.message);
  if (runs.error) throw new Error(runs.error.message);

  return { products: products.data ?? [], runs: runs.data ?? [] };
}
