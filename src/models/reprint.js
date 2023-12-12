const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    invoice:String,
    name:String,
    mode:String,
    date : Date
  
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("reprint", model);

module.exports = UserModule;
