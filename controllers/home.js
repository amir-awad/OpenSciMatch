const getHomePage = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/recommend");
  }
  res.render("home");
};

module.exports = { getHomePage };
