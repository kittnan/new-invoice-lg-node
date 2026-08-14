let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const NO_COMMON_DATA_MODEL = require("../models_no_common/no_common_data");
const NO_COMMON_DATA_FORM_MODEL = require("../models_no_common/no_common_data_form");
const moment = require("moment");

router.post("/create", async (req, res) => {
  try {
    const data = req.body.data;
    let invoices = [...new Set(data.map(d => d["Invoice no"]))]
    let deleteResult = await NO_COMMON_DATA_FORM_MODEL.deleteMany({
      invoice: {
        $in: invoices
      }
    })

    let formResult = await NO_COMMON_DATA_FORM_MODEL.bulkWrite(
      data.map(d => ({
        updateOne: {
          filter: { invoice: d["Invoice no"] },
          update: {
            $set: {
              invoiceForm: null,
              user: d["user"] || null,
              packingForm: null,
            }
          },
          upsert: true
        }
      }))
    )

    console.log(`⚡ ~ :19 ~ deleteResult:`, deleteResult);

    let deleteResult2 = await NO_COMMON_DATA_MODEL.deleteMany({
      "Invoice no": {
        $in: invoices
      }
    })

    console.log(`⚡ ~ :27 ~ deleteResult2:`, deleteResult2);

    const result = await NO_COMMON_DATA_MODEL.insertMany(data);
    res.status(200).json(result);
  } catch (error) {
    console.log(`⚡ ~ :16 ~ error:`, error);
    res.status(500).json({ message: error.message });
  }
})

router.get("/checkDuplicate", async (req, res) => {
  try {
    let { key, status } = req.query;
    if (!key) {
      return res.status(400).json({ message: "Key parameter is required" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status parameter is required" });
    }
    key = JSON.parse(key);
    status = JSON.parse(status)

    const existingRecord = await NO_COMMON_DATA_MODEL.aggregate([
      {
        $match: {
          "Invoice no": {
            $in: key
          },
          status: {
            $in: status
          }
        }
      },
      {
        $group: {
          _id: "$Invoice no"
        }
      },
      {
        $addFields: {
          "Invoice no": "$_id"
        }
      }
    ])
    res.json(existingRecord)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;
