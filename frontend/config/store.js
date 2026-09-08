/**
 * Single source of truth for supermarket-specific configuration.
 * Replace these values to rebrand the app for a real store.
 */
export const storeConfig = {
    name: "ErrandMart",
    tagline: "Your neighbourhood supermarket, now online",
    /** Short label used in the header lockup */
    logoInitials: "EM",
    /** Full international format, digits only — used for WhatsApp click-to-chat */
    whatsappNumber: import.meta.env["VITE_WHATSAPP_NUMBER"] ?? "2348012345678",
    whatsappDisplay: "+234 801 234 5678",
    currency: {
        code: "NGN",
        symbol: "₦",
        locale: "en-NG",
    },
    address: "12 Adeniyi Jones Avenue, Ikeja, Lagos",
    hours: "Mon – Sat, 8am – 9pm",
};
