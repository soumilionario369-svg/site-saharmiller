/*
 * SITE CONFIGURATION — the single place to edit before launch.
 * Loaded before main.js. Never put secrets here (this file is public).
 */
window.SITE_CONFIG = {
  // Real Whop checkout URL (https only). Leave "" until the owner supplies it.
  // While empty, every purchase button stays disabled and shows "Checkout link pending setup".
  WHOP_CHECKOUT_URL: "",

  // Page 2: every purchase button opens this on-site checkout page (public/checkout/, currently in SANDBOX mode).
  // Set "" to fall back to WHOP_CHECKOUT_URL.
  CHECKOUT_PAGE_PATH: "/checkout",

  // Public domain, e.g. "https://www.example.com". Leave "" until known (no canonical/og:url is written).
  SITE_URL: "https://yumwithsarah.com",

  // Customer-support email shown on the policy/contact pages (fixed in the page copy).
  CONTACT_EMAIL: "millersarahj980@gmail.com",

  // Contact form endpoint (server-side handler in api/contact.js; needs email-provider env vars, see README).
  CONTACT_ENDPOINT: "/api/contact",

  // Effective date of the Privacy and Refund policies (also written in the page HTML by scripts/build-pages.mjs).
  LEGAL_EFFECTIVE_DATE: "November 18, 2026",

  // Displayed pricing (single source for hero + final offer). Display only: the real charge is set in Whop.
  // The reference price/discount must be a genuine, supportable offer before publishing (see QA-CHECKLIST.md).
  PRICING: {
    referencePrice: "35.67",
    discountPercentage: 30,
    sellingPrice: "24.97",   // approved final price, never derived from the reference price
    currency: "USD"
  },

  // Name shown in the footer copyright line. Replace with the APPROVED business or brand name.
  BRAND_NAME: "Sarah Miller",

  // true = review build: shows QA notices. Set false for production
  // (also remove the <meta name="robots" content="noindex, nofollow"> tag in every HTML file).
  STAGING: false,

  // true = always show QA notices (red preview warning, "Checkout link pending setup") while STAGING is true.
  // Otherwise add ?qa=1 to the URL to see them. Visitors never see them.
  SHOW_QA_NOTICES: false,

  // Only hosts matching these suffixes are accepted as checkout destinations.
  ALLOWED_CHECKOUT_HOSTS: ["whop.com"]
};
