require("dotenv").config();
const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");

const FeedController = require("../controllers/feed");

describe("Feed Controller", function() {
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
  it("should add created post to posts of creator", function(done) {
    // Testing User.findOne()
    sinon.stub(User, "findOne");
    User.findOne.throws();

    // Dummy req
    const req = {
      body: {
        title: "dummy title",
        content: "dummy content"
      },
      file: {
        path: "dummy path"
      },
      userId: "5e396f9615f4e09d13540703"
    };

    const res = {
      status: function() {
        return this;
      },
      json: function() {}
    };
    // Testing async login function
    FeedController.postPost(req, res, () => {}).then(savedUser => {
      expect(savedUser).to.have.property("posts");
      expect(savedUser.posts).to.have.length(1);
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
