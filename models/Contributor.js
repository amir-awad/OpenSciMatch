const mongoose = require("mongoose");

const ContributorSchema = new mongoose.Schema({});

module.exports = mongoose.model("Contributor", ContributorSchema);
