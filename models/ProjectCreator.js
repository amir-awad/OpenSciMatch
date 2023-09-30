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
    type: mongoose.SchemaTypes.Email,
    validate: {
      validator: async function (email) {
        const user = await this.constructor.findOne({ email });
        if (user) {
          return this.id == user.id;
        }
        return true;
      },
      message: (props) => "The specified email address is already in use.",
    },
    required: [true, "User email required"],
  },

  phone_number: {
    type: String,
    required: [true, "must provide a phone number"],
  },

  expertise_level: {
    type: String,
    required: [true, "must provide expertise level"],
  },

  contributor_type: {
    type: String,
    required: [true, "must provide a type of contributor"],
  },

  project_description: {
    type: String,
    required: [true, "must provide a project description"],
  },

  mandatory_skills: {
    type: Array,
    required: [true, "must provide at least one mandatory skill"],
  },

  good_to_have_skills: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("ProjectCreator", ProjectCreatorSchema);
