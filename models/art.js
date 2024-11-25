const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const artSchema = new Schema({
  artist: {
    type: String,
  },
  location: {
    type: String,
  },
  plant: {
    type: String,
  },
  path: {
    type: String,
  },
  featured: {
    type: Boolean,
  },
  postingtime: {
    type: String,
  },
  code: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("Art", artSchema);
