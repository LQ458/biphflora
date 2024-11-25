const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment-timezone");

const editTextRequestSchema = new Schema({
  latinName: {
    type: String,
    unique: true,
  },
  chineseName: {
    type: String,
  },
  commonName: {
    type: String,
  },
  authorization: {
    type: Boolean,
  },
  otherNames: {
    type: String,
  },
  location: {
    type: String,
  },
  additionalInfo: {
    type: String,
  },
  link: {
    type: Array,
  },
  chineseLink: {
    type: Array,
  },
  editor: {
    type: String,
  },
  username: {
    type: String,
  },
  postingtime: {
    type: String,
    default: () =>
      moment()
        .tz("Asia/Shanghai")
        .format("YYYY-MM-DD HH:mm:ss")
        .replace("T", " ")
        .replace("Z", ""),
    immutable: true,
  },
  originalLatin: {
    type: String,
  },
});

module.exports = mongoose.model("EditTextRequest", editTextRequestSchema);
