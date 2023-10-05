const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "Uploaded file must have a name"],
  },
});

const File = mongoose.model("File", FileSchema);

module.exports = File;
