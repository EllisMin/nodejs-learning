require("dotenv").config();
const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");

const AuthController = require("../controllers/auth");

describe("Auth Controller - Login", function() {
  // Runs before all test cases
  before(function(done) {
    // db connection-- DO NOT USE Production db
    mongoose
      .connect(process.env.MONGODB_URI_MESSAGES_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(result => {
        // Dummy user
        const user = new User({
          _id: "5e396f9615f4e09d13540703",
          email: "test@a.com",
          password: "1234",
          name: "testname",
          posts: []
        });
        // Save test user
        return user.save();
      })
      .then(() => {
        done();
      });
  });
  
  // Runs before EVERY test case--may be useful to initialize
  // beforeEach(function() {})
  // Runs after EVERY test case
  // afterEach(function() {})

  // Use function(done) for use of async fun
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
    const req = { userId: "5e396f9615f4e09d13540703" };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.userStatus = data.status;
      }
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am new");
      done();
    });
  });

  after(function(done) {
    // Remove dummy users in db
    User.deleteMany({})
      .then(() => {
        // Disconnect db connection
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
