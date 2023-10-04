const request = require("request-promise");
const Contributor = require("../models/Contributor");
const ProjectCreator = require("../models/ProjectCreator");
const userLogin = require("../db/procedures");

const login = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/recommend");
  }
  res.render("index", {
    error: "",
  });
};

const checkLogin = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/recommend");
  }
  try {
    const { email, password, userRole } = req.body;
    const user = await userLogin(email, password, userRole);
    if (user) {
      let usersToMatch = {};
      let data = {};
      let options = {};
      if (userRole === "contributor") {
        usersToMatch = await ProjectCreator.find({});
        data = {
          user: user,
          role: userRole,
          usersToMatch: usersToMatch,
        };
      } else if (userRole === "project-creator") {
        usersToMatch = await Contributor.find({});
        data = {
          user: user,
          role: userRole,
          usersToMatch: usersToMatch,
        };
      }

      options = {
        method: "POST",
        url: "http://127.0.0.1:3000/get-matched-users",
        body: data,
        json: true,
      };

      let matchedUsers = [];
      await request(options)
        .then(function (response) {
          matchedUsers = response["matchedUsers"];
          console.log(matchedUsers, "matchedUsers in auth.js");
          req.session.recommendMatchedUsers = matchedUsers;
        })
        .catch(function (err) {
          console.log(err);
        });

      req.session.user = user;
      req.session.role = userRole;
      console.log(
        `logged in successfully! with userRole = ${req.session.role}`,
      );

      // redirect to "/recommend" page with user, role, matchedUsers, and similarity_detail by using res.redirect and url query
      res.redirect("/recommend");
    } else {
      res.render("index", {
        error: "invalid credentials",
      });
    }
  } catch (error) {
    res.render("index", {
      error: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  if (!req.session.user) {
    return res.status(409).send("you are already logged out!");
  }
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("/", {
          error: "Something went wrong",
        });
      }
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const registerContributor = async (req, res) => {
  console.log(req.body);
  try {
    const {
      description,
      name,
      password,
      email,
      contributorType,
      phoneNumber,
      skills,
      expertiseLevel,
      availability,
    } = req.body;
    const contributor = await Contributor.create({
      description,
      name,
      password,
      email,
      contributor_type: contributorType,
      phone_number: phoneNumber,
      skills,
      expertise_level: expertiseLevel,
      availability: new Date(availability),
    });
    console.log(req.body, `Contributor registered: ${contributor}`);

    res.status(201).send("contributor registered successfully!");
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

const registerProjectCreator = async (req, res) => {
  console.log(req.body);
  try {
    const {
      name,
      password,
      email,
      phoneNumber,
      expertiseLevel,
      contributorType,
      projectDescription,
      mandatorySkills,
      goodToHaveSkills,
    } = req.body;

    // remove the "Remove" suffix in each mandatory skill and good to have skill
    for (let i = 0; i < mandatorySkills.length; i++) {
      mandatorySkills[i] = mandatorySkills[i].substring(
        0,
        mandatorySkills[i].length - 6,
      );
    }

    for (let i = 0; i < goodToHaveSkills.length; i++) {
      goodToHaveSkills[i] = goodToHaveSkills[i].substring(
        0,
        goodToHaveSkills[i].length - 6,
      );
    }

    const projectCreator = await ProjectCreator.create({
      name,
      password,
      email,
      phone_number: phoneNumber,
      expertise_level: expertiseLevel,
      contributor_type: contributorType,
      project_description: projectDescription,
      mandatory_skills: mandatorySkills,
      good_to_have_skills: goodToHaveSkills,
    });

    console.log(req.body, `Creator registered: ${projectCreator}`);

    res.status(201).send("project creator registered successfully!");
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = {
  login,
  checkLogin,
  logout,
  registerContributor,
  registerProjectCreator,
};
