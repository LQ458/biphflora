const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const featureHomeSchema = new Schema({
  works: {
    pic: {
      type: Object,
    },
    art: {
      type: Object,
    },
  },
});

module.exports = mongoose.model("featureHome", featureHomeSchema);
