import { useEffect, useMemo, useState } from "react";
import { Search, X, MessageCircle, Store, Clock } from "lucide-react";

import { StoreHeader } from "@/components/StoreHeader";
import { FloatingOrderBar } from "@/components/FloatingOrderBar";
import { OrderSheet } from "@/components/OrderSheet";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/config/store";
import { searchProducts, listCategories } from "@/libs/api";
import type { Product } from "@/libs/types";

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const [orderOpen, setOrderOpen] = useState(false);
  const debouncedTerm = useDebounced(term);

  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listCategories().then(setCategories).catch(() => setError(true));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    void searchProducts({ query: debouncedTerm, category, limit: 48 })
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [debouncedTerm, category]);
  const heading = useMemo(() => {
    if (debouncedTerm) return `Results for “${debouncedTerm}”`;
    if (category) return category;
    return "Popular in store";
  }, [debouncedTerm, category]);

  return (
    <div className="min-h-screen pb-28">
      <StoreHeader onOpenOrder={() => setOrderOpen(true)} />

      <main className="mx-auto max-w-5xl px-4">
        <section className="surface-hero -mx-4 px-4 pb-6 pt-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Shop the aisles, send your list on WhatsApp
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Find what you need, add it to your list, and we&apos;ll confirm availability and
              delivery with you directly.
            </p>

            <div className="relative mt-6">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search milk, spaghetti, indomie, detergent…"
                aria-label="Search products"
                className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-12 text-base shadow-card outline-none ring-ring/40 transition focus:ring-2"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
              <CategoryChip active={category === ""} onClick={() => setCategory("")}>
                All
              </CategoryChip>
              {categories.map((c) => (
                <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </CategoryChip>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-6">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">{heading}</h2>
            {!loading && (
              <span className="text-xs text-muted-foreground">
                {products.length} product{products.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {error ? (
            <EmptyState
              title="We couldn't load the catalogue"
              body="Please check your connection and try again."
              action={
                <Button variant="soft" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              }
            />
          ) : loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products matched"
              body={`We couldn't find anything for “${debouncedTerm}”. Try a shorter word, or ask us on WhatsApp.`}
              action={
                <Button variant="soft" onClick={() => setTerm("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-border pb-10 pt-8 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Store className="size-4" /> {storeConfig.address}
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Clock className="size-4" /> {storeConfig.hours}
          </p>
          <p className="mt-2 flex items-center gap-2">
            <MessageCircle className="size-4" /> {storeConfig.whatsappDisplay}
          </p>
          <p className="mt-4 text-xs">
            Prices are sample data for demonstration.{" "}
              <a href="/admin" className="underline underline-offset-4">
              Store admin
              </a>
          </p>
        </footer>
      </main>

      <FloatingOrderBar onOpen={() => setOrderOpen(true)} />
      <OrderSheet open={orderOpen} onOpenChange={setOrderOpen} />
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-card text-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft">
        <Search className="size-6 text-brand" />
      </div>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
