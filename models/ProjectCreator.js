const mongoose = require("mongoose");

const ProjectCreatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must provide a name"],
  },

  project_description: {
    type: String,
    required: [true, "must provide a project description"],
  },

  mandatory_skills: {
    type: Array,
    required: [true, "must provide at least one mandatory skill"],
  },

  desired_skills: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("ProjectCreator", ProjectCreatorSchema);
