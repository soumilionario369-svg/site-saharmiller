/* Checkout test config. Public file: NEVER put API keys or tokens here (Elements needs none client-side).
 * Fill in the three SANDBOX Plan IDs from https://sandbox.whop.com/dashboard. Empty = checkout stays disabled. */
window.CHECKOUT_TEST = {
  ENVIRONMENT: "sandbox", // "sandbox" | "production". Keep "sandbox" until all tests pass.

  PRODUCTS: {
    main:       { title: "200 Delicious Recipes",   price: 24.97, planId: "plan_wOUJTHkfpCmp6" },       // required
    breakfasts: { title: "50 Breakfasts & Snacks",  price: 9.97,  planId: "plan_ROrOMB7Kn32RX" },     // optional
    christmas:  { title: "30 Christmas Desserts",   price: 4.97,  planId: "plan_JYf8I6gAgt7jc" }      // optional
  },

  // Absolute path on this test server; the page turns it into a full URL. Whop requires https (http only for localhost).
  RETURN_PATH: "/success.html"
};
