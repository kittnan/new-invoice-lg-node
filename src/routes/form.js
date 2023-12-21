let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const PKTA = require("../models/pkta");
const PACKING = require("../models/packing");
const FORM = require("../models/form");
const REPRINT = require("../models/reprint");
const ItemCode = require("../models/item-code");
const Consignee = require("../models/consignee");
const KTC_Address = require("../models/ktc-address");
const Accountee = require("../models/accountee");
const Country = require("../models/country");
const Model = require("../models/model");
const moment = require("moment");

router.get("/", async (req, res, next) => {
  try {
    let { key, status } = req.query;
    let con = [
      {
        $match: {},
      },
    ];
    if (key) {
      key = JSON.parse(key);
      con.push({
        $match: {
          invoice: key,
        },
      });
    }
    if (status) {
      status = JSON.parse(status);
      con.push({
        $match: {
          status: {
            $in: status,
          },
        },
      });
    }
    const usersQuery = await FORM.aggregate(con);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    let { key, date, status } = req.query;
    let con = [
      {
        $match: {},
      },
    ];
    if (key) {
      key = JSON.parse(key);
      con.push({
        $match: {
          invoice: {
            $regex: new RegExp(key, "i"),
          },
        },
      });
    }
    if (status) {
      status = JSON.parse(status);
      con.push({
        $match: {
          status: {
            $in: status,
          },
        },
      });
    }
    if (date) {
      date = JSON.parse(date);
      if (date.start && date.end) {
        con.push({
          $match: {
            createdAt: {
              $gte: moment(date.start).startOf("day").toDate(),
              $lte: moment(date.end).endOf("day").toDate(),
            },
          },
        });
      } else if (date.start) {
        con.push({
          $match: {
            createdAt: {
              $gte: moment(date.start).startOf("day").toDate(),
            },
          },
        });
      } else if (date.end) {
        con.push({
          $match: {
            createdAt: {
              $lte: moment(date.end).endOf("day").toDate(),
            },
          },
        });
      }
    }
    con.push({
      $lookup: {
        from: "reprints",
        localField: "invoice",
        foreignField: "invoice",
        as: "reprint",
      },
    });
    con.push({
      $sort: {
        createdAt: -1,
      },
    });
    const usersQuery = await FORM.aggregate(con);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.post("/create", async (req, res, next) => {
  try {
    const payload = req.body;
    // createFormInvoice(payload)
    const data = await FORM.insertMany(req.body);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

// function createFormInvoice(data){
//   try {
//     const
//   } catch (error) {
//     console.log("🚀 ~ error:", error)

//   }
// }
router.post("/createOrUpdate", async (req, res, next) => {
  try {
    const form = req.body.map((a) => {
      if (a._id) {
        return {
          updateOne: {
            filter: { _id: new ObjectId(a._id) },
            update: { $set: a },
          },
        };
      } else {
        return {
          insertOne: { document: a },
        };
      }
    });
    const data = await FORM.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/update", async (req, res, next) => {
  try {
    const data = await FORM.updateOne(
      {
        invoice: req.body.invoice,
      },
      {
        $set: req.body,
      }
    );
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/updateByInvoice", async (req, res, next) => {
  try {
    const data = await FORM.updateOne(
      {
        invoice: req.body.invoice,
      },
      {
        $set: req.body,
      }
    );
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/delete", async (req, res, next) => {
  try {
    const form = req.body.map((a) => {
      a["active"] = false;
      return {
        updateOne: {
          filter: { _id: ObjectId(a._id) },
          update: { $set: a },
        },
      };
    });
    const data = await FORM.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.delete("/deleteAllByInvoice", async (req, res, next) => {
  try {
    let { invoice } = req.query;

    // todo delete at PKTA
    await PKTA.deleteMany({
      "Delivery Note#": invoice,
    });
    // todo delete at FORM
    await FORM.deleteMany({
      invoice: invoice,
    });
    // todo delete at REPRINT
    await REPRINT.deleteMany({
      invoice: invoice,
    });

    // todo delete at PACKING
    const result = await PACKING.deleteMany({
      "Invoice No": invoice,
    });
    res.json(result);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
module.exports = router;
