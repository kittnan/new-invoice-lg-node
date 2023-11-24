let express = require("express");
let router = express.Router();
const apicache = require("apicache-plus");
let cache = apicache.middleware;
let XLSX = require("xlsx");
const KTC_ADDRESS = require("../models/ktc-address");
const cacheStr = "ngRef";
router.get("/", async (req, res, next) => {
  try {
    const usersQuery = await KTC_ADDRESS.aggregate([{ $match: {} }]);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
