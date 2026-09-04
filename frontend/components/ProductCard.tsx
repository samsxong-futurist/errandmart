import { useState } from "react";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/libs/currency";
import { useCart } from "@/libs/cart";
import type { Product } from "@/libs/types";

function Placeholder({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-full w-full items-center justify-center bg-brand-soft">
      <span className="font-display text-3xl font-semibold text-brand/50">{letter}</span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add, setQuantity, quantityOf } = useCart();
  const quantity = quantityOf(product.id);
  const [failed, setFailed] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-float">
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {product.image_url && !failed ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Placeholder name={product.product_name} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.product_name}</h3>
        <p className="mt-auto font-display text-lg font-semibold text-brand">
          {formatPrice(product.price)}
        </p>

        {quantity === 0 ? (
          <Button
            variant="brand"
            className="w-full rounded-xl"
            size="lg"
            onClick={() => add(product)}
            aria-label={`Add ${product.product_name} to order`}
          >
            <ShoppingBasket /> Add
          </Button>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-brand-soft p-1">
            <Button
              variant="ghost"
              size="touch"
              onClick={() => setQuantity(product.id, quantity - 1)}
              aria-label={`Reduce ${product.product_name}`}
            >
              <Minus />
            </Button>
            <span className="min-w-8 text-center font-display text-lg font-semibold">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="touch"
              onClick={() => setQuantity(product.id, quantity + 1)}
              aria-label={`Add another ${product.product_name}`}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
