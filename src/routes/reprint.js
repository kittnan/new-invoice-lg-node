let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const REPRINT = require("../models/reprint");
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
    const usersQuery = await REPRINT.aggregate(con);
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
            printDate: {
              $gte: moment(date.start).startOf("day").toDate(),
              $lte: moment(date.end).endOf("day").toDate(),
            },
          },
        });
      } else if (date.start) {
        con.push({
          $match: {
            printDate: {
              $gte: moment(date.start).startOf("day").toDate(),
            },
          },
        });
      } else if (date.end) {
        con.push({
          $match: {
            printDate: {
              $lte: moment(date.end).endOf("day").toDate(),
            },
          },
        });
      }
    }
    con.push({
      $lookup: {
        from: "packings",
        localField: "SO#",
        foreignField: "(KGSS) Customer PO",
        as: "packing",
      },
    });
    const usersQuery = await REPRINT.aggregate(con);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.post("/create", async (req, res, next) => {
  try {
    const data = await REPRINT.insertMany(req.body)
    res.json(data)
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
    const data = await REPRINT.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/update", async (req, res, next) => {
  try {
    const data = await REPRINT.updateOne(
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
    const data = await REPRINT.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await REPRINT.deleteOne({ _id: id });
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
module.exports = router;
