const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "Unit price": {
      type: Number,
      default: 0
    },
    "NET WEIGHT": {
      type: Number,
      default: 0
    },
    "Start case#": {
      type: Number,
      default: 0
    },
    "Case Quantity": {
      type: Number,
      default: 0
    },
    "quantity shipped": {
      type: Number,
      default: 0
    },
    "GROSS WEIGHT": {
      type: Number,
      default: 0
    },
    "Measurement (vertical)": {
      type: Number,
      default: 0
    },
    "Measurement (horizontal)": {
      type: Number,
      default: 0
    },
    "Measurement (High)": {
      type: Number,
      default: 0
    },
    "Packing content category": {
      type: Number,
      default: 0
    },
    "rowNum": {
      type: Number,
      default: 0
    },
    "status": {
      type: String,
      default: 'available'
    },
  },
  { timestamps: true, versionKey: false, strict: false }
);

const DataModule = mongoose.model("no_common_datas", model);

module.exports = DataModule;
