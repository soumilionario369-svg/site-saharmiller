/* INTERNAL LIVE PAYMENT TEST: real Whop plans with REDUCED prices, for controlled live testing only.
 * Public file: NEVER put API keys or tokens here (Whop Elements needs none client-side).
 *
 * These are NOT the official commercial plans. Official plans/prices are untouched:
 *   main $24.97, breakfasts $9.97, christmas $4.97 (see /checkout, still SANDBOX).
 * Do not copy these IDs into /checkout/config.js. */
window.CHECKOUT_LIVE_TEST = {
  ENVIRONMENT: "production", // real charges

  PRODUCTS: {
    main:       { title: "200 Delicious Recipes",  price: 1.50, planId: "plan_kw21fsInK8tlN" },   // required, $1.50
    breakfasts: { title: "50 Breakfasts & Snacks", price: 1.25, planId: "plan_N1VQiuN7uNgcD" },   // optional, $1.25
    christmas:  { title: "30 Christmas Desserts",  price: 1.00, planId: "plan_3thwVRsKKzFQV" }    // optional, $1.00
  },

  // Absolute path on this site; the page turns it into a full URL (Whop requires https, or localhost).
  RETURN_PATH: "/checkout-live-test/success.html"
};
