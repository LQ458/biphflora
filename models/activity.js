const { url } = require("inspector");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  name: {
    type: String,
  },
  link: {
    type: String,
  },
  pictureUrls: {
    type: Array,
  },
  thumbnailPic: {
    type: String,
  },
  auth: {
    type: Boolean,
  },
  thumbnailDescriptions: {
    type: String,
  },
  specificDescriptions: {
    type: String,
  },
});

module.exports = mongoose.model("Activity", activitySchema);
