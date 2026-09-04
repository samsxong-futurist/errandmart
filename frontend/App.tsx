import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/libs/cart";
import HomePage from "@/routes/index";
import AdminPage from "@/routes/admin";

export function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  return (
    <CartProvider>
      {path === "/admin" ? <AdminPage /> : <HomePage />}
      <Toaster position="top-center" />
    </CartProvider>
  );
}