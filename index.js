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
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(compression());

app.use("/ktc-address", require("./src/routes/ktc-address"));

app.use("/consignee", require("./src/routes/consignee"));

app.use("/consignee-code", require("./src/routes/consignee-code"));

app.use("/accountee", require("./src/routes/accountee"));

app.use("/pkta", require("./src/routes/pkta"));

app.use("/packing", require("./src/routes/packing"));

app.use("/item-code", require("./src/routes/item-code"));

app.use("/country", require("./src/routes/country"));

app.use("/model", require("./src/routes/model"));

app.use("/users", require("./src/routes/users"));

app.use("/reprint", require("./src/routes/reprint"));

app.use("/form", require("./src/routes/form"));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST ,PUT ,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-with,Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

module.exports = app;
