/* COMMERCIAL checkout config (official prices, real Whop plans). Public file: NEVER put API keys or tokens here
 * (Whop Elements needs none client-side).
 *
 * Not used here, kept for reference:
 *   SANDBOX plans (sandbox.whop.com): main plan_wOUJTHkfpCmp6, breakfasts plan_ROrOMB7Kn32RX, christmas plan_JYf8I6gAgt7jc
 *   Reduced-price live-test plans: kept only in the local backup (_backup/), never published
 */
window.CHECKOUT_TEST = {
  ENVIRONMENT: "production", // real charges. "sandbox" shows the test banner (use the sandbox plan IDs above if you switch back).

  PRODUCTS: {
    main:       { title: "200 Delicious Recipes",   price: 24.97, planId: "plan_HUqKSzBbl524N" },   // required
    breakfasts: { title: "50 Breakfasts & Snacks",  price: 9.97,  planId: "plan_JXhV2GKmRAa29" },   // optional
    christmas:  { title: "30 Christmas Desserts to Share",   price: 4.97,  planId: "plan_4o4IJxtku7ETL" }    // optional
  },

  // Absolute path on this site; the page turns it into a full URL (Whop requires https, or localhost).
  RETURN_PATH: "/success.html"
};
