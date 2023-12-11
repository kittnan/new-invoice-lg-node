const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    itemCode: String,
    itemName: String,
    active: Boolean,
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("item_codes", model);

module.exports = UserModule;
