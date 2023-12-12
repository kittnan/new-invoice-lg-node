let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let app = express();
let morgan = require("morgan");
let mongoose = require("mongoose");
let compression = require("compression");
let apicache = require("apicache-plus");

mongoose.set("strictQuery", false);

const dotenv = require("dotenv");

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
console.log("PORT:", process.env.PORT);
let mongooseConnect = require("./connect");
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log("Listening on  port " + server.address().port);
});

app.use(morgan("tiny"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cors());
app.use(compression());

let KTC_ADDRESS = require("./src/routes/ktc-address");
app.use("/ktc-address", KTC_ADDRESS);

let CONSIGNEE = require("./src/routes/consignee");
app.use("/consignee", CONSIGNEE);

let CONSIGNEE_CODE = require("./src/routes/consignee-code");
app.use("/consignee-code", CONSIGNEE_CODE);

let ACCOUNTEE = require("./src/routes/accountee");
app.use("/accountee", ACCOUNTEE);

let PKTA = require("./src/routes/pkta");
app.use("/pkta", PKTA);

let PACKING = require("./src/routes/packing");
app.use("/packing", PACKING);

let ITEM_CODE = require("./src/routes/item-code");
app.use("/item-code", ITEM_CODE);

let COUNTRY = require("./src/routes/country");
app.use("/country", COUNTRY);

let MODEL = require("./src/routes/model");
app.use("/model", MODEL);

let Users = require("./src/routes/users");
app.use("/users", Users);

let Reprint = require("./src/routes/reprint");
app.use("/reprint", Reprint);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST ,PUT ,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-with,Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

module.exports = app;
