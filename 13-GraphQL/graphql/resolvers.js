const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Post = require("../models/post");
const validator = require("validator");
const jwt = require("jsonwebtoken");

module.exports = {
  // createUser({ userInput }, req){}
  createUser: async function({ userInput }, req) {
    // Option 1 (without destructuring):
    // const email = args.userInput.email;

    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Invalid email" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Invalid password" });
    }
    // Error exists
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      // Add more error data
      error.data = errors;
      error.code = 422;

      throw error;
    }

    const existingUser = await User.findOne({ email: userInput.email });

    // Don't create a new user
    if (existingUser) {
      const error = new Error("User already exists");
      throw error;
    }

    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async function({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      // 401: could not authenticate
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Incorrect password");
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      "someSecretStringValue!@",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },

  createPost: async function({ postInput }, req) {
    // Check for authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid" });
    }
    // Error exists
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      // Add more error data
      error.data = errors;
      error.code = 422;

      throw error;
    }
    // Get user from db
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid user");
      error.code = 401;
      throw error;
    }
    // Create new post
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imgUrl: postInput.imgUrl,
      creator: user
    });
    const createdPost = await post.save();
    // Push post on user data
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  },

  posts: async function(args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    const totalPosts = await Post.find().countDocuments();
    // -1: Sort by descending order
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("creator");
    // Follow the PostData from schema
    return {
      posts: posts.map(p => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        };
      }),
      totalPosts: totalPosts
    };
  }
};
