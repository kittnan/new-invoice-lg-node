const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    code: String,
    line1: String,
    line2: String,
    line3: String,
    line4: String,
    line5: String,
    line6: String,
    active: {
      type: Boolean,
      default: true,
      require: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("consignee", model);

module.exports = UserModule;
