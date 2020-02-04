const expect = require("chai").expect;
const sinon = require("sinon");

const User = require("../models/user");

const AuthController = require("../controllers/auth");

describe("Auth Controller - Login", function() {

  it("should throw an error with status code 500 when fails to access db", function(done) {
    // Testing User.findOne()
    sinon.stub(User, "findOne");
    User.findOne.throws();

    // Dummy req
    const req = {
      body: {
        email: "test@a.com",
        password: "123456"
      }
    };
    // Testing async login function
    AuthController.login(req, {}, () => {}).then(result => {
      //   console.log(result); ///
      expect(result).to.be.an("error");
      // statusCode = 500
      expect(result).to.have.property("statusCode", 500);
      // Wait for above function to be done login() is async
      done();
    });

    User.findOne.restore();
  });
});
