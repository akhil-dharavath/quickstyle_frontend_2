// PATCH for Checkout.jsx — replace only the finalTotal calculation and order summary display
// Find these exact lines in your Checkout.jsx and replace them:

// ─── FIND (line ~278) ───────────────────────────────────────────────────────
//   const finalTotal = total + Math.round(total * 0.05) - discount;
// ─── REPLACE WITH ────────────────────────────────────────────────────────────
//   const DELIVERY_FEE = 40; // Must match orderController.js
//   const finalTotal = total + Math.round(total * 0.05) - discount + DELIVERY_FEE;

// ─── FIND in the order summary JSX (around line 860-880) ────────────────────
//   <div className="flex justify-between text-gray-500 ...">
//     <span>Shipping</span>
//     <span className="font-medium text-green-600 ...">Free</span>
//   </div>
// ─── REPLACE WITH ────────────────────────────────────────────────────────────
//   <div className="flex justify-between text-gray-500 dark:text-gray-400">
//     <span>Delivery Fee</span>
//     <span className="font-medium text-gray-900 dark:text-white">₹{DELIVERY_FEE}</span>
//   </div>

// ─── IMPORTANT: Also fix shopId extraction (around line ~155) ────────────────
// FIND:
//   const shopId = items?.[0]?.shopId ?? items?.[0]?.shop ?? null;
// REPLACE WITH:
//   // shopId may be a populated object from MongoDB, extract the _id string
//   const rawShopId = items?.[0]?.shopId ?? items?.[0]?.shop ?? null;
//   const shopId = rawShopId?._id || rawShopId || null;

// ─── Full updated lines for context ──────────────────────────────────────────
// The three changes are small but critical:
// 1. DELIVERY_FEE constant (sync with backend)
// 2. finalTotal includes the fee
// 3. shopId handles populated object (not just string)
