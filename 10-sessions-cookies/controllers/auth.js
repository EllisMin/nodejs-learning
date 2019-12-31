exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.get("Cookie").split("=")[1]; // set to true
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  // this data gets lost after response is finished
  // req.isLoggedIn = true;

  // Sends cookie that gets stored in the browser;
  // visible in Application->Cookies tab or Network-> page's header
  // expiration: session or 1969/../.. that expires on closing browser
  res.setHeader("Set-Cookie", "loggedIn=true");
  res.redirect("/");
};
