const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Post = require("../models/post");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { clearImage } = require("../util/file");

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
      imageUrl: postInput.imageUrl,
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

  posts: async function({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    // Pagination logic
    if (!page) {
      page = 1;
    }
    const perPage = 2;

    const totalPosts = await Post.find().countDocuments();
    // -1: Sort by descending order
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
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
  },

  post: async function({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("Post not found");
      error.code = 404;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  },
  updatePost: async function({ id, postInput }, req) {
    // Check if logged in
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = r01;
      throw error;
    }

    // Populate creator to get a full user data
    const post = await Post.findById(id).populate("creator");
    // Check if post exists
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }

    // Check whether user is the creator
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized");
      error.code = 403;
      throw error;
    }

    // Validation check
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

    // Edit title, content, imageUrl(if changed)
    post.title = postInput.title;
    post.content = postInput.content;

    if (postInput.imageUrl !== "undefined") {
      post.imageUrl = postInput.imageUrl;
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString()
    };
  },

  deletePost: async function({ id }, req) {
    // Check if logged in
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = r01;
      throw error;
    }
    const post = await Post.findById(id);
    // Check if post exists
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }

    // Check whether user is the creator
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized");
      error.code = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(id);
    const user = await User.findById(req.userId);
    // pull id of the post removed
    user.posts.pull(id);
    await user.save();
    return true;
  },

  user: async function(args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = r01;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.code = 404;
      throw error;
    }
    return { ...user._doc, _id: user._id.toString() };
  },

  updateStatus: async function({ status }, req) {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.code = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    return { ...user._doc, _id: user._id.toString() };
  }
};
