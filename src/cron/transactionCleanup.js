const cron = require("node-cron");
const Transaction = require("../models/Transaction");

// Run every hour
cron.schedule("0 * * * *", async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await Transaction.deleteMany({
      status: "PENDING",
      createdAt: { $lt: twentyFourHoursAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Deleted ${result.deletedCount} expired pending transactions`);
    }

  } catch (error) {
    console.error("Cron transaction cleanup error:", error);
  }
});
