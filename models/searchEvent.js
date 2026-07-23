const mongoose = require("mongoose");

const searchEventSchema = new mongoose.Schema(
  {
    catalogType: {
      type: String,
      enum: ["plant", "bird"],
      required: true,
      immutable: true,
    },
    languageCategory: {
      type: String,
      enum: ["cjk", "latin_script", "mixed_or_other"],
      required: true,
      immutable: true,
    },
    resultCount: {
      type: Number,
      min: 0,
      max: 3,
      required: true,
      immutable: true,
    },
    selected: { type: Boolean, required: true, immutable: true },
    occurredAt: { type: Date, required: true, immutable: true },
  },
  {
    collection: "search_events",
    versionKey: false,
  },
);

module.exports = mongoose.model("SearchEvent", searchEventSchema);
