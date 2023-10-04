const Contributor = require("../models/Contributor");
const ProjectCreator = require("../models/ProjectCreator");

const search = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    res.render("search", {
      user: req.session.user,
      role: req.session.role,
    });
  } catch (error) {
    res.render("index", {
      error: "Internal server error",
    });
  }
};

const getSearchResults = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    if (req.session.role === "contributor") {
      const {
        mandatorySkills,
        goodToHaveSkills,
        contributorType,
        expertiseLevel,
      } = req.body;

      const projectCreators = await ProjectCreator.find({
        mandatory_skills: mandatorySkills,
        good_to_have_skills: goodToHaveSkills,
        contributor_type: contributorType,
        expertise_level: expertiseLevel,
      });

      console.log(projectCreator, "projectCreators in search.js");

      res.render("search", {
        user: req.session.user,
        role: req.session.role,
        projectCreators: projectCreators,
      });
    } else if (req.session.role === "projectCreator") {
      const { skills, contributorType, expertiseLevel } = req.body;

      const contributors = await Contributor.find({
        skills: skills,
        contributor_type: contributorType,
        expertise_level: expertiseLevel,
      });

      console.log(contributors, "contributors in search.js");

      res.render("search", {
        user: req.session.user,
        role: req.session.role,
        contributors: contributors,
      });
    }
  } catch (error) {
    res.render("search", {
      error: "Internal server error",
    });
  }
};

module.exports = { search, getSearchResults };
