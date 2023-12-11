const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "Processed DT": Date,
    printDate: Date,
    printStatus: Boolean,
  },
  { timestamps: true, versionKey: false, strict: false }
);

const UserModule = mongoose.model("pkta", model);

module.exports = UserModule;
