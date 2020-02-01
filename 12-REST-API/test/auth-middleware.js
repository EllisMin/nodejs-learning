const expect = require("chai").expect;
const authMiddleware = require("../middleware/is-auth");

// Testing error of auth header in auth middleware
it("should throw an error if no authorization header is set", function() {
  // const authHeader = req.get("Authorization")
  const req = {
    get: function() {
      return null; // simulating there's no authorization header
    }
  };

  // Left empty for fields that are not tested; bind() to prevent original error message
  expect(authMiddleware.bind(this,req, {}, () => {})).to.throw("Not authenticated");
});
