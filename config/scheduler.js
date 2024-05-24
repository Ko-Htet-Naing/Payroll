const cron = require("node-cron");
const updateLeaveValue = require("../services/leaveUpdateServices");

// ('0 0') => 0 မိနစ် 0 နာရီ midnight မှာ ပြန် reset ချမယ်လို့ ပြောချင်တာ
// 1 => လ၁လ ရဲ့ ကနဦး ၁ ရက်နေ့ကျရင်

cron.schedule("0 0 1 * *", async () => {
  console.log("Running Leave Value Update Task...");
  await updateLeaveValue();
});
