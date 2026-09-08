import { useMemo, useState } from "react";
import { ArrowLeft, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeConfig } from "@/config/store";
import { formatPrice } from "@/libs/currency";
import { downloadCsvFile, INTERNAL_FIELDS, guessMapping, parseCsv, parsePrice } from "@/libs/csv";
import { adminOverview, importProducts, } from "@/libs/api";
export default function AdminPage() {
    const [passcode, setPasscode] = useState("");
    const [unlocked, setUnlocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);
    const [fileName, setFileName] = useState("");
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [mapping, setMapping] = useState({
        product_name: "",
        price: "",
        image_url: "",
        sku: "",
        category: "",
    });
    const [deactivateMissing, setDeactivateMissing] = useState(false);
    const refresh = async (code) => {
        const data = await adminOverview(code);
        setOverview(data);
    };
    const unlock = async () => {
        setLoading(true);
        try {
            await refresh(passcode);
            setUnlocked(true);
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to unlock admin");
        }
        finally {
            setLoading(false);
        }
    };
    const onFile = async (file) => {
        const text = await file.text();
        const parsed = parseCsv(text);
        if (parsed.length < 2) {
            toast.error("That file has no data rows");
            return;
        }
        const [head, ...body] = parsed;
        setFileName(file.name);
        setHeaders(head);
        setRows(body);
        setMapping(guessMapping(head));
    };
    const preparedRows = useMemo(() => {
        if (!mapping.product_name || !mapping.price)
            return [];
        const idx = (col) => headers.indexOf(col);
        return rows
            .map((row) => {
            const name = (row[idx(mapping.product_name)] ?? "").trim();
            const price = parsePrice(row[idx(mapping.price)]);
            if (!name || price === null)
                return null;
            return {
                product_name: name,
                price,
                image_url: mapping.image_url ? (row[idx(mapping.image_url)] ?? null) : null,
                sku: mapping.sku ? (row[idx(mapping.sku)] ?? null) : null,
                category: mapping.category ? (row[idx(mapping.category)] ?? null) : null,
            };
        })
            .filter((r) => r !== null);
    }, [rows, headers, mapping]);
    const runImport = async () => {
        setLoading(true);
        try {
            const result = await importProducts({
                passcode,
                fileName,
                rows: preparedRows,
                deactivateMissing,
            });
            toast.success(`${result.created} added · ${result.updated} updated`);
            setRows([]);
            setHeaders([]);
            setFileName("");
            await refresh(passcode);
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Import failed");
        }
        finally {
            setLoading(false);
        }
    };
    const downloadCurrentCatalogue = () => {
        const products = overview?.products ?? [];
        downloadCsvFile(`${storeConfig.name.toLowerCase().replace(/\s+/g, "-")}-catalogue.csv`, [
            ["product_name", "price", "image_url", "sku", "category"],
            ...products.map((product) => [
                product.product_name,
                String(product.price),
                product.image_url ?? "",
                product.sku ?? "",
                product.category ?? "",
            ]),
        ]);
    };
    const downloadCsvSample = () => {
        downloadCsvFile("products-upload-sample.csv", [
            ["product_name", "price", "image_url", "sku", "category"],
            ["Example Product", "1000", "", "SKU-001", "Groceries"],
        ]);
    };
    if (!unlocked) {
        return (<div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="font-display text-xl font-semibold">Catalogue admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the store passcode to manage products.
          </p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input id="passcode" type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlock()} className="h-11 rounded-xl"/>
          </div>
          <Button variant="brand" size="lg" className="mt-4 w-full" disabled={!passcode || loading} onClick={unlock}>
            {loading && <Loader2 className="animate-spin"/>} Unlock
          </Button>
          <a href="/" className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4"/> Back to store
          </a>
        </div>
      </div>);
    }
    return (<div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Catalogue admin</h1>
          <p className="text-sm text-muted-foreground">{storeConfig.name}</p>
        </div>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
          View store
        </a>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold">Import price list (CSV)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Export your inventory sheet as CSV, then map its columns to our fields. Existing products
          are matched by SKU first, then by exact product name — nothing is duplicated.
        </p>

        <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center hover:bg-muted">
          <Upload className="size-6 text-brand"/>
          <span className="text-sm font-medium">{fileName || "Choose a CSV file"}</span>
          <span className="text-xs text-muted-foreground">
            Columns can be named anything — you map them below.
          </span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file)
                void onFile(file);
        }}/>
        </label>

        {headers.length > 0 && (<div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {INTERNAL_FIELDS.map((field) => (<div key={field.key} className="space-y-1">
                  <Label htmlFor={`map-${field.key}`}>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  <select id={`map-${field.key}`} value={mapping[field.key]} onChange={(e) => setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="">— not in file —</option>
                    {headers.map((h) => (<option key={h} value={h}>
                        {h}
                      </option>))}
                  </select>
                </div>))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={deactivateMissing} onChange={(e) => setDeactivateMissing(e.target.checked)} className="size-4 accent-brand"/>
              Hide products that are not in this file (treat file as full catalogue)
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="brand" size="lg" disabled={preparedRows.length === 0 || loading} onClick={runImport}>
                {loading ? <Loader2 className="animate-spin"/> : <CheckCircle2 />}
                Import {preparedRows.length} product{preparedRows.length === 1 ? "" : "s"}
              </Button>
              {preparedRows.length === 0 && (<span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <AlertCircle className="size-4"/> Map product name and price to continue.
                </span>)}
            </div>
          </div>)}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Catalogue files</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Download the current catalogue or a ready-to-fill upload template.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="soft" size="sm" disabled={!overview || overview.products.length === 0} onClick={downloadCurrentCatalogue}>
              <Download /> Download catalogue
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCsvSample}>
              <Download /> Download sample
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold">Recent imports</h2>
        {overview && overview.runs.length > 0 ? (<ul className="mt-3 space-y-2 text-sm">
            {overview.runs.map((run) => (<li key={run.id} className="flex flex-wrap justify-between gap-2">
                <span>{run.file_name ?? "Manual import"}</span>
                <span className="text-muted-foreground">
                  {run.rows_created} added · {run.rows_updated} updated ·{" "}
                  {new Date(run.created_at).toLocaleString()}
                </span>
              </li>))}
          </ul>) : (<p className="mt-2 text-sm text-muted-foreground">
            No imports yet — the catalogue is showing sample data.
          </p>)}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold">
          Current catalogue ({overview?.products.length ?? 0} shown)
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3 text-right">Price</th>
                <th className="py-2 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(overview?.products ?? []).map((p) => (<tr key={p.id} className={p.is_active ? "" : "opacity-50"}>
                  <td className="py-2 pr-3">{p.product_name}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{p.sku ?? "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{p.category ?? "—"}</td>
                  <td className="py-2 pr-3 text-right font-medium">{formatPrice(p.price)}</td>
                  <td className="py-2 text-right text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </section>
    </div>);
}
