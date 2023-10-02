const express = require("express");
const router = express.Router();

const {
  logout,
  registerContributor,
  registerProjectCreator,
} = require("../controllers/auth");

router.route("/logout").get(logout);
router.route("/register-contributor").post(registerContributor);
router.route("/register-project-creator").post(registerProjectCreator);

module.exports = router;
