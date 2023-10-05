const express = require("express");
const router = express.Router();

const { getHomePage } = require("../controllers/home");

router.route("/").get(getHomePage);

module.exports = router;
