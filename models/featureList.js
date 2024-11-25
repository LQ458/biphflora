const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const featureListSchema = new Schema({
  name: {
    type: String,
  },
  plant: {
    type: Array,
  },
});

module.exports = mongoose.model("featureList", featureListSchema);
