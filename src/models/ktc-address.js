const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    line1: String,
    line2: String,
    line3: String,
    line4: String,
    line5: String,
  },
  { timestamps: true, versionKey: false, strict: false }
);

const UserModule = mongoose.model("ktc_address", model);

module.exports = UserModule;
