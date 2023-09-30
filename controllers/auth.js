const Contributor = require("../models/Contributor");
const ProjectCreator = require("../models/ProjectCreator");
const userLogin = require("../db/procedures");

const loginContributor = async (req, res) => {
  if (req.session.username) {
    return res.status(409).send("you are already logged in!");
  }
  try {
    const { email, password } = req.body;
    const contributor = await userLogin(email, password, "contributor");
    if (contributor) {
      req.session.username = contributor.name;
      res.status(201).json({ contributor });
    } else {
      res.status(400).json({ msg: "invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const loginProjectCreator = async (req, res) => {
  if (req.session.username) {
    return res.status(409).send("you are already logged in!");
  }
  try {
    const { email, password } = req.body;
    const projectCreator = await userLogin(email, password, "projectCreator");
    if (projectCreator) {
      req.session.username = projectCreator.name;
      res.status(201).json({ projectCreator });
    } else {
      res.status(400).json({ msg: "invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const logout = async (req, res) => {
  if (!req.session.username) {
    return res.status(409).send("you are already logged out!");
  }
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ msg: err });
      }
      res.status(200).json({ msg: "logged out" });
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

    res.status(201).send("project creator registered successfully!");
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = {
  loginContributor,
  loginProjectCreator,
  logout,
  registerContributor,
  registerProjectCreator,
};
