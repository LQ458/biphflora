const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const codeSchema = new Schema({
  count: {
    type: Number,
  },
  type: {
    type: String,
  },
});

module.exports = mongoose.model("Code", codeSchema);
