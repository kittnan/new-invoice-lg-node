const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    employee_code: String,
    name: String,
    auth_admin: String,
    auth_user: String,
    active: {
      type: Boolean,
      default: true,
      require: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("users", model);

module.exports = UserModule;
