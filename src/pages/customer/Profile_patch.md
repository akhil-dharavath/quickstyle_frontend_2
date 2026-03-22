# Profile.jsx - Fix myOrders filter

Find (line ~76):
  const myOrders = orders.filter(o => o.customerId === (user?._id || user?.id));

Replace with:
  const userId = user?._id || user?.id;
  const myOrders = orders.filter(o =>
    o.userId === userId ||
    o.customerId === userId ||
    o.userId?._id === userId
  ).slice(0, 2);
