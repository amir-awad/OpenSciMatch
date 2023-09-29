const mongoose = require("mongoose");
require("mongoose-type-email");
mongoose.SchemaTypes.Email.defaults.message = "Email address is invalid";

const ContributorSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "must provide a description"],
  },
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

  contributor_type: {
    type: String,
    required: [true, "must provide a contributor type"],
  },

  phone_number: {
    type: String,
    required: [true, "must provide a phone number"],
  },

  skills: {
    type: Array,
    default: [],
  },

  expertise_level: {
    type: String,
    required: [true, "must provide a level of expertise"],
  },

  availability: {
    type: Date,
    required: [true, "must provide an availability date"],
  },
});

module.exports = mongoose.model("Contributor", ContributorSchema);
