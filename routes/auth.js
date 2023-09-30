const express = require("express");
const router = express.Router();

const {
  login,
  logout,
  registerContributor,
  registerProjectCreator,
} = require("../controllers/auth");

router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/register-contributor").post(registerContributor);
router.route("/register-project-creator").post(registerProjectCreator);

module.exports = router;
