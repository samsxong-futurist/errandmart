import { useState } from "react";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBasket } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/libs/cart";
import { formatPrice } from "@/libs/currency";
import { buildOrderMessage, buildWhatsAppUrl } from "@/libs/whatsapp";
import { storeConfig } from "@/config/store";

export function OrderSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lines, total, itemCount, setQuantity, remove, clear } = useCart();
  const [note, setNote] = useState("");

  const send = () => {
    const url = buildWhatsAppUrl(buildOrderMessage(lines, total, note));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex h-[88vh] flex-col rounded-t-3xl p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-display text-xl">Your order list</SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? "Nothing selected yet."
              : `${itemCount} item${itemCount === 1 ? "" : "s"} ready to send to ${storeConfig.name}.`}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-brand-soft">
              <ShoppingBasket className="size-7 text-brand" />
            </div>
            <p className="font-display text-lg font-semibold">Your list is empty</p>
            <p className="text-sm text-muted-foreground">
              Search for a product and tap Add to start building your order.
            </p>
            <Button variant="soft" onClick={() => onOpenChange(false)}>
              Start shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {lines.map((line) => (
                <div key={line.product.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.product.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(line.product.price)} each
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant="soft"
                        size="icon"
                        className="rounded-lg"
                        onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                      <Button
                        variant="soft"
                        size="icon"
                        className="rounded-lg"
                        onClick={() => setQuantity(line.product.id, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(line.product.id)}
                        aria-label={`Remove ${line.product.product_name}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <p className="font-display text-base font-semibold">
                    {formatPrice(line.product.price * line.quantity)}
                  </p>
                </div>
              ))}

              <div className="py-4">
                <label htmlFor="order-note" className="text-xs font-medium text-muted-foreground">
                  Note for the store (optional)
                </label>
                <Textarea
                  id="order-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. deliver to Ikeja GRA this evening"
                  className="mt-1 resize-none rounded-xl"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-border bg-card px-5 pb-6 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Items total</span>
                <span className="font-display text-2xl font-semibold">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery fee and availability are confirmed on WhatsApp. No payment happens here.
              </p>
              <Button variant="brand" size="xl" className="w-full" onClick={send}>
                <MessageCircle /> Send order on WhatsApp
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  clear();
                  setNote("");
                }}
              >
                Clear list
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
