import { storeConfig } from "@/config/store";
/** Formats a numeric amount as Nigerian Naira, e.g. 12999 -> "₦12,999" */
export function formatPrice(amount) {
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    const hasKobo = rounded % 1 !== 0;
    return (storeConfig.currency.symbol +
        rounded.toLocaleString(storeConfig.currency.locale, {
            minimumFractionDigits: hasKobo ? 2 : 0,
            maximumFractionDigits: 2,
        }));
}
