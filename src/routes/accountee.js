let express = require("express");
let router = express.Router();
const apicache = require("apicache-plus");
let cache = apicache.middleware;
let XLSX = require("xlsx");
const ACCOUNTEE = require("../models/accountee");
const cacheStr = "ngRef";
router.get("/", async (req, res, next) => {
  try {
    const usersQuery = await ACCOUNTEE.aggregate([{ $match: {} }]);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
