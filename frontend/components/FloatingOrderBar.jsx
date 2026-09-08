import { ChevronUp } from "lucide-react";
import { useCart } from "@/libs/cart";
import { formatPrice } from "@/libs/currency";
export function FloatingOrderBar({ onOpen }) {
    const { itemCount, total } = useCart();
    if (itemCount === 0)
        return null;
    return (<div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4">
      <button type="button" onClick={onOpen} className="animate-rise-in pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-brand-foreground shadow-float transition-transform active:scale-[0.99]">
        <span className="font-display text-base font-semibold">
          {itemCount} item{itemCount === 1 ? "" : "s"} · {formatPrice(total)}
        </span>
        <span className="flex items-center gap-1 text-sm opacity-90">
          View order <ChevronUp className="size-4"/>
        </span>
      </button>
    </div>);
}
