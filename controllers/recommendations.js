const recommend = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    const { user, role, matchedUsers, similarity_details } = req.session;

    res.render("recommend", {
      user: user,
      role: role,
      matchedUsers: matchedUsers,
      similarity_details: similarity_details,
    });
  } catch (error) {
    res.render("index", {
      error: "Internal server error",
    });
  }
};

module.exports = { recommend };
