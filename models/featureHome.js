const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const featureHomeSchema = new Schema(
  {
    works: {
      pic: {
        plant: String,
        art: String,
        modifiedBy: String,
        season: String,
        takenBy: String,
        location: String,
        path: String,
        time: String,
        featured: Boolean,
        code: String,
      },
      art: {
        plant: String,
        location: String,
        artist: String,
        path: String,
        code: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FeatureHome", featureHomeSchema);
