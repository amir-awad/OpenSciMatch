const ProjectCreator = require("../models/ProjectCreator");

const getAllProjectCreators = async (req, res) => {
  try {
    const projectCreators = await ProjectCreator.find({});
    res.status(200).json({ projectCreators });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getProjectCreator = async (req, res) => {
  try {
    const { id: projectCreatorID } = req.params;
    const projectCreator = await ProjectCreator.findOne({
      _id: projectCreatorID,
    });
    if (!projectCreator) {
      return res
        .status(404)
        .json({ msg: `no project creator with id : ${projectCreatorID}` });
    }
    res.status(200).json({ projectCreator });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const createProjectCreator = async (req, res) => {
  try {
    const projectCreator = await ProjectCreator.create(req.body);
    res.status(201).json({ projectCreator });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = {
  getAllProjectCreators,
  getProjectCreator,
  createProjectCreator,
};
