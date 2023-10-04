const express = require("express");
const router = express.Router();

const { search, getSearchResults } = require("../controllers/search");

router.route("/").get(search).post(getSearchResults);

module.exports = router;
