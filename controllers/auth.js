const request = require("request-promise");
const Contributor = require("../models/Contributor");
const ProjectCreator = require("../models/ProjectCreator");
const userLogin = require("../db/procedures");

const login = async (req, res) => {
  if (req.session.user) {
    return res.status(409).send("you are already logged in!");
  }
  res.render("index", {
    error: "",
  });
};

const checkLogin = async (req, res) => {
  if (req.session.user) {
    return res.status(409).send("you are already logged in!");
  }
  try {
    const { email, password, userRole } = req.body;
    const user = await userLogin(email, password, userRole);
    if (user) {
      const data = {
        user: user,
        role: userRole,
      };

      const options = {
        method: "POST",
        url: "http://127.0.0.1:3000/get-matched-users",
        body: data,
        json: true,
      };

      let matchedUsers = [];
      const sendRequest = await request(options)
        .then(function (response) {
          matchedUsers = response["matchedUsers"];
          console.log(matchedUsers, matchedUsers);
          req.session.user = user;
        })
        .catch(function (err) {
          console.log(err);
        });

      console.log("logged in successfully!");
      res.render("recommend", {
        user: user,
        role: userRole,
        matchedUsers: matchedUsers,
      });
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
