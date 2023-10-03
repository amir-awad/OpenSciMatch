const express = require("express");
const router = express.Router();

const { login, checkLogin } = require("../controllers/auth");

router.route("/").get(login).post(checkLogin);

module.exports = router;
