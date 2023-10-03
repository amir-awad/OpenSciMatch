const express = require("express");
const router = express.Router();

const { recommend } = require("../controllers/recommendations");

router.route("/").get(recommend);

module.exports = router;
