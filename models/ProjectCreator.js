const mongoose = require("mongoose");

mongoose.Schema.Types.Array.checkRequired((v) => Array.isArray(v) && v.length);

const ProjectCreatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must provide a name"],
  },

  password: {
    type: String,
    required: [true, "must provide a password"],
  },

  email: {
    type: String,
    required: [true, "must provide an email"],
    unique: true,
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
