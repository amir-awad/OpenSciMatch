const mongoose = require("mongoose");

const ContributorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must provide a name"],
  },

  skills: {
    type: Array,
    default: [],
  },

  level_of_expertise: {
    type: String,
    required: [true, "must provide a level of expertise"],
  },

  availability: {
    type: Date,
    required: [true, "must provide an availability date"],
  },
});

module.exports = mongoose.model("Contributor", ContributorSchema);
