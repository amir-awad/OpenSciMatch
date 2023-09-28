const Contributor = require("../models/Contributor");

const getAllContributors = async (req, res) => {
  try {
    const contributors = await Contributor.find({});
    res.status(200).json({ contributors });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getContributor = async (req, res) => {
  try {
    const { id: contributorID } = req.params;
    const contributor = await Contributor.findOne({ _id: contributorID });
    if (!contributor) {
      return res
        .status(404)
        .json({ msg: `no contributor with id : ${contributorID}` });
    }
    res.status(200).json({ contributor });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const createContributor = async (req, res) => {
  try {
    const contributor = await Contributor.create(req.body);
    res.status(201).json({ contributor });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = { getAllContributors, getContributor, createContributor };
