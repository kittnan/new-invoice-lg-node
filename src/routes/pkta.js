let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const PKTA = require("../models/pkta");

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

// router.get("/key", async (req, res, next) => {
//   try {
//     const { key } = req.query;
//     const usersQuery = await PKTA.aggregate([
//       {
//         $match: {
//           "Delivery Note#": key,
//         },
//       },
//     ]);
//     res.json(usersQuery);
//   } catch (error) {
//     console.log("🚀 ~ error:", error);
//     res.sendStatus(500);
//   }
// });

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
        const bwRes = await PKTA.bulkWrite(form)
        const data = await PKTA.insertMany(req.body.data);
        res.json(data);
      } else {
        let qData = await PKTA.aggregate([
          {
            $match: {
              "Delivery Note#": {
                $in: invoices,
              },
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
module.exports = router;
