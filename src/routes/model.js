let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const MODEL = require("../models/model");

router.get("/", async (req, res, next) => {
  try {
    const usersQuery = await MODEL.aggregate([
      {
        $match: {},
      },
    ]);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const data = await MODEL.insertMany(req.body);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

router.post("/import", async (req, res, next) => {
  try {
    const deleteStat = await MODEL.deleteMany({});
    console.log("🚀 ~ deleteStat:", deleteStat);
    const data = await MODEL.insertMany(req.body);
    res.json(data);
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
    const data = await MODEL.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.put("/update", async (req, res, next) => {
  try {
    const data = await MODEL.updateOne(
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
    const data = await MODEL.bulkWrite(form);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await MODEL.deleteOne({ _id: id });
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
module.exports = router;
