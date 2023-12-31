const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    reprint: [
      {
        date: Date,
        user: String,
      },
    ],
  },
  { timestamps: true, versionKey: false, strict: false }
);

const UserModule = mongoose.model("packing", model);

module.exports = UserModule;
