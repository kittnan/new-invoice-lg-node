const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "status": {
      type: String,
      default: 'available'
    },
  },
  { timestamps: true, versionKey: false, strict: false }
);

const DataModule = mongoose.model("no_common_data_forms", model);

module.exports = DataModule;
