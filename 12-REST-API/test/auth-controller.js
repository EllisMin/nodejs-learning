const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

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

  // Testing db
  it("should send a response with a valid user status for an existing user", function(done) {
    // db connection-- DO NOT USE Production db
    mongoose
      .connect(process.env.MONGODB_URI_MESSAGES_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(result => {
        const user = new User({
          email: "test@a.com",
          password: "1234",
          name: "testname",
          posts: []
        });
        // Save test user
        return user.save();
      })
      .then(res => {})
      .catch(err => {
        console.log(err);
      });
  });
});
