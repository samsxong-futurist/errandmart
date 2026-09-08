import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
const STORAGE_KEY = "supermarket-order-list";
const CartContext = createContext(null);
export function CartProvider({ children }) {
    const [lines, setLines] = useState([]);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw)
                setLines(JSON.parse(raw));
        }
        catch {
            /* ignore malformed storage */
        }
        setHydrated(true);
    }, []);
    useEffect(() => {
        if (!hydrated)
            return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }, [lines, hydrated]);
    const add = useCallback((product) => {
        setLines((prev) => {
            const existing = prev.find((l) => l.product.id === product.id);
            if (existing) {
                return prev.map((l) => l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l);
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, []);
    const setQuantity = useCallback((productId, quantity) => {
        setLines((prev) => quantity <= 0
            ? prev.filter((l) => l.product.id !== productId)
            : prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
    }, []);
    const remove = useCallback((productId) => {
        setLines((prev) => prev.filter((l) => l.product.id !== productId));
    }, []);
    const clear = useCallback(() => setLines([]), []);
    const value = useMemo(() => {
        const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
        const total = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);
        return {
            lines,
            itemCount,
            total,
            quantityOf: (id) => lines.find((l) => l.product.id === id)?.quantity ?? 0,
            add,
            setQuantity,
            remove,
            clear,
        };
    }, [lines, add, setQuantity, remove, clear]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx)
        throw new Error("useCart must be used within a CartProvider");
    return ctx;
}
