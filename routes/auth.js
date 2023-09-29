const express = require("express");
const router = express.Router();

const {
  loginContributor,
  logout,
  loginProjectCreator,
  registerContributor,
  registerProjectCreator,
} = require("../controllers/auth");

router.route("/login-contributor").post(loginContributor);
router.route("/login-project-creator").post(loginProjectCreator);
router.route("/logout").get(logout);
router.route("/register-contributor").post(registerContributor);
router.route("/register-project-creator").post(registerProjectCreator);

module.exports = router;
