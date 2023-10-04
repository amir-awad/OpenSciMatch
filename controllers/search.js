const request = require("request-promise");
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
      contributors: "",
      projectCreators: "",
    });
  } catch (error) {
    res.render("index", {
      error: "Internal server error",
    });
  }
};

const getSearchResults = async (req, res) => {
  console.log(req.body, "req.body in search.js");
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    if (req.session.role === "contributor") {
      console.log("in contributor");
      let {
        mandatorySkills,
        goodToHaveSkills,
        contributorType,
        expertiseLevel,
      } = req.body;

      let mandatory_skills = [];
      mandatorySkills = mandatorySkills.split(",");

      mandatorySkills.forEach((skill) => {
        mandatory_skills.push(skill.trim());
      });

      console.log(mandatory_skills, "mandatory_skills in search.js above");

      let good_to_have_skills = [];
      if (!(goodToHaveSkills === "")) {
        goodToHaveSkills = goodToHaveSkills.split(",");
        goodToHaveSkills.forEach((skill) => {
          good_to_have_skills.push(skill.trim());
        });
      }

      console.log(
        good_to_have_skills,
        "good_to_have_skills in search.js above",
      );

      const usersToMatch = await ProjectCreator.find({
        mandatory_skills: mandatory_skills,
        good_to_have_skills: good_to_have_skills,
        contributor_type: contributorType,
        expertise_level: expertiseLevel,
      });

      console.log(usersToMatch, "usersToMatch in search.js above");

      //   const data = {
      //     user: req.session.user,
      //     role: req.session.role,
      //     usersToMatch: usersToMatch,
      //   };

      //   console.log(data, "data in search.js above");

      //   const options = {
      //     method: "POST",
      //     url: "http://127.0.0.1:3000/get-matched-users",
      //     body: data,
      //     json: true,
      //   };

      //   let matchedUsers = [];
      //   await request(options)
      //     .then(function (response) {
      //       matchedUsers = response["matchedUsers"];
      //       console.log(matchedUsers, "matchedUsers in search.js above");
      //     })
      //     .catch(function (err) {
      //       console.log(err);
      //     });

      res.render("search", {
        user: req.session.user,
        role: req.session.role,
        projectCreators: usersToMatch,
        contributors: "",
      });
    } else if (req.session.role === "project-creator") {
      const { skills, contributorType, expertiseLevel } = req.body;
      let skillsArray = [];
      skills.split(",").forEach((skill) => {
        skillsArray.push(skill.trim());
      });

      const usersToMatch = await Contributor.find({
        skills: skillsArray,
        contributor_type: contributorType,
        expertise_level: expertiseLevel,
      });

      console.log(usersToMatch, "usersToMatch in search.js below");

      //   const data = {
      //     user: req.session.user,
      //     role: req.session.role,
      //     usersToMatch: usersToMatch,
      //   };

      //   const options = {
      //     method: "POST",
      //     url: "http://127.0.0.1:3000/get-matched-users",
      //     body: data,
      //     json: true,
      //   };

      //   let matchedUsers = [];
      //   await request(options)
      //     .then(function (response) {
      //       matchedUsers = response["matchedUsers"];
      //       console.log(matchedUsers, "matchedUsers in search.js below");
      //     })
      //     .catch(function (err) {
      //       console.log(err);
      //     });

      res.render("search", {
        user: req.session.user,
        role: req.session.role,
        contributors: usersToMatch,
        projectCreators: "",
      });
    }
  } catch (error) {
    res.render("search", {
      error: "Internal server error",
      role: "",
      contributors: "",
      projectCreators: "",
    });
  }
};

module.exports = { search, getSearchResults };
