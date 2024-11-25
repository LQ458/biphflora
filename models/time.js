const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSchema = new Schema({
  time: {
    type: String,
  },
  pics: {
    type: Array,
  },
  user: {
    type: String,
  },
});

module.exports = mongoose.model("Time", timeSchema);
