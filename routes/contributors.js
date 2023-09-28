const express = require("express");
const router = express.Router();

const {
  getAllContributors,
  getContributor,
  createContributor,
} = require("../controllers/contributors");

router.route("/").get(getAllContributors).post(createContributor);
router.route("/:id").get(getContributor);

module.exports = router;
