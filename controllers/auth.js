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
  try {
    const { name, password, email, skills, levelOfExpertise, availability } =
      req.body;
    const contributor = await Contributor.create({
      name,
      password,
      email,
      skills,
      level_of_expertise: levelOfExpertise,
      availability: new Date(availability),
    });

    res.status(201).send("contributor registered successfully!");
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const registerProjectCreator = async (req, res) => {
  try {
    const {
      name,
      password,
      email,
      projectDescription,
      mandatorySkills,
      desiredSkills,
    } = req.body;

    const projectCreator = await ProjectCreator.create({
      name,
      password,
      email,
      project_description: projectDescription,
      mandatory_skills: mandatorySkills,
      desired_skills: desiredSkills,
    });

    res.status(201).send("project creator registered successfully");
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
