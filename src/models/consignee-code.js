const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "CONSIGNEE-CODE": String,
    active: {
      type: Boolean,
      default: true,
      require: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("consignee_code", model);

module.exports = UserModule;
