let express = require("express");
let router = express.Router();
const apicache = require("apicache-plus");
let cache = apicache.middleware;
let XLSX = require("xlsx");
const CONSIGNEE = require("../models/consignee");
const cacheStr = "ngRef";
router.get("/", async (req, res, next) => {
  try {
    const usersQuery = await CONSIGNEE.aggregate([{ $match: {} }]);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
