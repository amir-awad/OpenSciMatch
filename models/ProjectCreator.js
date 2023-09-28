const mongoose = require("mongoose");

const ProjectCreatorSchema = new mongoose.Schema({});

module.exports = mongoose.model("ProjectCreator", ProjectCreatorSchema);
