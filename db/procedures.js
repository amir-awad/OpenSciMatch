const ProjectCreator = require("../models/ProjectCreator");
const Contributor = require("../models/Contributor");

const userLogin = async (email, password, role) => {
  if (role == "projectCreator") {
    const projectCreator = await ProjectCreator.findOne({ password, email });
    if (projectCreator) {
      return projectCreator;
    }
  } else if (role == "contributor") {
    const contributor = await Contributor.findOne({ password, email });
    if (contributor) {
      return contributor;
    }
  }

  return null;
};

module.exports = userLogin;
