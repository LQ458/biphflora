const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const creationBottomSchema = new Schema({
  auth: {
    type: Boolean,
  },
  name: {
    type: String,
  },
  commonName: {
    type: String,
  },
  chineseName: {
    type: String,
  },
  plant: {
    type: String,
  },
  art: {
    type: String,
  },
  pic: {
    type: String,
  },
  creator: {
    type: String,
  },
  photographer: {
    type: String,
  },
  date: {
    type: String,
  },
  location: {
    type: String,
  },
  featured: {
    type: Boolean,
  },
  artist: {
    type: String,
  },
  photoDate: {
    type: String,
  },
  artDate: {
    type: String,
  },
  artCode: {
    type: String,
    unique: true,
  },
  picCode: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("CreationBottom", creationBottomSchema);
