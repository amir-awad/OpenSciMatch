const express = require("express");
const router = express.Router();

const {
  getAllProjectCreators,
  getProjectCreator,
  createProjectCreator,
} = require("../controllers/projectCreators");

router.route("/").get(getAllProjectCreators).post(createProjectCreator);
router.route("/:id").get(getProjectCreator);

module.exports = router;
