const expect = require("chai").expect;
const authMiddleware = require("../middleware/is-auth");

// Group Auth middleware tests together
describe("Auth middleware", function() {
  // Testing error of auth header in auth middleware
  it("should throw an error if no authorization header is set", function() {
    // const authHeader = req.get("Authorization")
    const req = {
      get: function() {
        return null; // simulating there's no authorization header
      }
    };

    // Left empty for fields that are not tested; bind() to prevent original error message
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated"
    );
  });

  it("should throw an error if authorization header is only one string", function() {
    const req = {
      get: function() {
        return "aaa";
      }
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should throw error if token cannot be verified", function() {
    const req = {
      get: function(headerName) {
        return "Bearer aaa";
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should give userId after decoding token", function() {
    const req = {
      get: function(headerName) {
        return "Bearer asdfasdf";
      }
    };
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
  });
});
