let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const PKTA = require("../models/pkta");
const PACKING = require("../models/packing");
const FORM = require("../models/form");
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
          "Delivery Note#": key,
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
    const usersQuery = await PKTA.aggregate(con);
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
    let con2 =[
      {
        $match:{}
      }
    ]
    if (key) {
      key = JSON.parse(key);
    }
    con.push({
      $match: {
        "Delivery Note#": {
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

    
    const res1 = await PKTA.aggregate(con);
    const res2 = await FORM.aggregate(con2)
    res.json({
      pkta:res1,
      form:res2
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
          "Delivery Note#": {
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
        localField: "Delivery Note#",
        foreignField: "invoice",
        as: "reprint",
      },
    });
    const usersQuery = await PKTA.aggregate(con);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.post("/create", async (req, res, next) => {
  try {
    if (req.body.data) {
      let invoices = req.body.data.map((a) => a["Delivery Note#"]);
      console.log("🚀 ~ invoices:", invoices);
      if (req.body.option && req.body.option == "clear") {
        const form = req.body.data.map((a) => {
          return {
            deleteMany: {
              filter: {
                "Delivery Note#": a["Delivery Note#"],
              },
            },
          };
        });
        // todo delete at PKTA
        const bwRes = await PKTA.bulkWrite(form);
        // todo delete at FORM
        const form2 = req.body.data.map((a) => {
          return {
            deleteMany: {
              filter: {
                "invoice": a["Delivery Note#"],
                
              },
            },
          };
        });
        await FORM.bulkWrite(form2)

        const form3 = req.body.data.map((a) => {
          return {
            deleteMany: {
              filter: {
                "Invoice No": a["Delivery Note#"],
                
              },
            },
          };
        });
        await PACKING.bulkWrite(form3)

        const data = await PKTA.insertMany(req.body.data);
        res.json(data);
      } else {
        let qData = await PKTA.aggregate([
          {
            $match: {
              "Delivery Note#": {
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
          const data = await PKTA.insertMany(req.body.data);
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
    const data = await PKTA.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/update", async (req, res, next) => {
  try {
    const data = await PKTA.updateOne(
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
    const data = await PKTA.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await PKTA.deleteOne({ _id: id });
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/deleteByInvoice", async (req, res, next) => {
  try {
    await PKTA.updateMany(
      {
        "Delivery Note#": req.body.invoice,
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
