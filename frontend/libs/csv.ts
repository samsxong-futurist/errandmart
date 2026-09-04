/** Minimal RFC4180-ish CSV parser (handles quoted fields and embedded commas). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const clean = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Turns "₦1,200.50" or "1 200" into 1200.5. Returns null when unparseable. */
export function parsePrice(value: string | undefined | null): number | null {
  if (value == null) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function downloadCsvFile(fileName: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([`${csv}\r\n`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export const INTERNAL_FIELDS = [
  { key: "product_name", label: "Product name", required: true },
  { key: "price", label: "Price", required: true },
  { key: "image_url", label: "Image URL", required: false },
  { key: "sku", label: "SKU", required: false },
  { key: "category", label: "Category", required: false },
] as const;

export type InternalField = (typeof INTERNAL_FIELDS)[number]["key"];

/** Best-effort automatic mapping of a supplier's column names to internal fields. */
export function guessMapping(headers: string[]): Record<InternalField, string> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const find = (candidates: string[]) =>
    headers.find((h) => candidates.some((c) => norm(h).includes(c))) ?? "";

  return {
    product_name: find(["itemdescription", "productname", "description", "item", "product", "name"]),
    price: find(["sellingprice", "unitprice", "price", "amount", "rate"]),
    image_url: find(["imageurl", "image", "photo", "picture"]),
    sku: find(["sku", "itemcode", "barcode", "code", "ref"]),
    category: find(["category", "department", "group", "class"]),
  };
}
