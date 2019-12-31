module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log("You don't have permission on this page"); ///
    return res.redirect("/login");
  }
  next();
};
