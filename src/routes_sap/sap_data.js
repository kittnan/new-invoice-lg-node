let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const SAP_DATA_MODEL = require("../models_sap/sap_data");
const PACKING = require("../models_sap/sap_packing");
const FORM = require("../models_sap/sap_form");
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
          "External Delivery ID": key,
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
    const usersQuery = await SAP_DATA_MODEL.aggregate(con);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.get("/checkDuplicate", async (req, res, next) => {
  try {
    let { key, status } = req.query;
    let con = [
      {
        $match: {},
      },
    ];
    let con2 = [
      {
        $match: {}
      }
    ]
    if (key) {
      key = JSON.parse(key);
    }
    con.push({
      $match: {
        "External Delivery ID": {
          $in: key,
        },
      },
    });
    con2.push({
      $match: {
        "invoice": {
          $in: key,
        },
      },
    });
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


    const res1 = await SAP_DATA_MODEL.aggregate(con);
    const res2 = await FORM.aggregate(con2)
    res.json({
      data: res1,
      form: res2
    });
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
          "External Delivery ID": {
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
        localField: "External Delivery ID",
        foreignField: "invoice",
        as: "reprint",
      },
    });
    const usersQuery = await SAP_DATA_MODEL.aggregate(con);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.post("/create", async (req, res, next) => {
  try {
    if (req.body.data) {
      let invoices = req.body.data.map((a) => a["External Delivery ID"]);
      console.log("🚀 ~ invoices:", invoices);
      if (req.body.option && req.body.option == "clear") {
        const form = req.body.data.map((a) => {
          return {
            deleteMany: {
              filter: {
                "External Delivery ID": a["External Delivery ID"],
              },
            },
          };
        });
        // todo delete at PKTA
        const bwRes = await SAP_DATA_MODEL.bulkWrite(form);
        // todo delete at FORM
        const form2 = req.body.data.map((a) => {
          return {
            deleteMany: {
              filter: {
                "invoice": a["External Delivery ID"],

              },
            },
          };
        });
        await FORM.bulkWrite(form2)

        const form3 = req.body.data.map((a) => {
          return {
            deleteMany: {
              filter: {
                "Invoice No": a["External Delivery ID"],

              },
            },
          };
        });
        await PACKING.bulkWrite(form3)

        const data = await SAP_DATA_MODEL.insertMany(req.body.data);
        res.json(data);
      } else {
        let qData = await SAP_DATA_MODEL.aggregate([
          {
            $match: {
              "External Delivery ID": {
                $in: invoices,
              },
              status: "available",
            },
          },
        ]);
        console.log("🚀 ~ qData:", qData);
        if (qData && qData.length > 0) {
          throw "duplicate invoice please check!!";
        } else {
          const data = await SAP_DATA_MODEL.insertMany(req.body.data);
          res.json(data);
        }
      }
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
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
    const data = await SAP_DATA_MODEL.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/update", async (req, res, next) => {
  try {
    const data = await SAP_DATA_MODEL.updateOne(
      {
        _id: new ObjectId(req.body._id),
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
    const data = await SAP_DATA_MODEL.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await SAP_DATA_MODEL.deleteOne({ _id: id });
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/deleteByInvoice", async (req, res, next) => {
  try {
    await SAP_DATA_MODEL.updateMany(
      {
        "External Delivery ID": req.body.invoice,
      },
      {
        $set: {
          status: "unavailable",
        },
      }
    );
    const data = await PACKING.updateMany(
      {
        "Invoice No": req.body.invoice,
      },
      {
        $set: {
          status: "unavailable",
        },
      }
    );
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
module.exports = router;
