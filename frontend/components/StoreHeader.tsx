import { ShoppingBasket } from "lucide-react";
import { storeConfig } from "@/config/store";
import { formatPrice } from "@/libs/currency";
import { useCart } from "@/libs/cart";

export function StoreHeader({ onOpenOrder }: { onOpenOrder: () => void }) {
  const { itemCount, total } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <a href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand font-display text-sm font-bold text-brand-foreground">
            {storeConfig.logoInitials}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold leading-tight">
              {storeConfig.name}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {storeConfig.tagline}
            </span>
          </span>
        </a>

        <button
          type="button"
          onClick={onOpenOrder}
          aria-label="Open order list"
          className="ml-auto flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left shadow-card transition-colors hover:bg-accent"
        >
          <span className="relative">
            <ShoppingBasket className="size-5 text-brand" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-highlight text-[10px] font-bold text-highlight-foreground">
                {itemCount}
              </span>
            )}
          </span>
          <span className="hidden text-xs leading-tight sm:block">
            <span className="block text-muted-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
            <span className="block font-semibold">{formatPrice(total)}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
