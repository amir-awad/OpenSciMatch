const mongoose = require("mongoose");
require("mongoose-type-email");
mongoose.SchemaTypes.Email.defaults.message = "Email address is invalid";

const ContributorSchema = new mongoose.Schema({
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
