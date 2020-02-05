const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const curPage = req.query.page || 1;
  const perPage = 2;
  // let totalItems;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 }) // sort by descending order
      .skip((curPage - 1) * perPage)
      .limit(perPage);

    // Status code 200 is default
    res.status(200).json({
      message: "Fetched posts",
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postPost = async (req, res, next) => {
  // Error handling
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided");
    err.statusCode = 422;
    throw error;
  }

  const imgUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imgUrl: imgUrl,
    creator: req.userId
  });
  try {
    const result = await post.save();
    // console.log(result); ///
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    // Send message to all connected users
    io.getIO().emit("post event", {
      action: "create",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
    });

    // Create post in db; Status 201 is to tell resource is created, successfully
    res.status(201).json({
      message: "Post created",
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      error.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    // Error handling
    if (!post) {
      const error = new Error("Could not find the post");
      err.statusCode = 404;
      // Passed down to catch()
      throw error;
    }
    res.status(200).json({ message: "Post fetched", post: post });
  } catch (err) {
    if (!err.statusCode) {
      error.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  // Validation
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imgUrl = req.body.image;
  if (req.file) {
    imgUrl = req.file.path;
  }
  if (!imgUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }
  try {
    // Update in db
    const post = await Post.findById(postId).populate("creator");
    // Post doesn't exist
    if (!post) {
      const error = new Error("Could not find the post");
      error.statusCode = 404;
      // Passed down to catch()
      throw error;
    }
    // Authorize user
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      throw error;
    }

    if (imgUrl !== post.imgUrl) {
      clearImage(post.imgUrl);
    }
    post.title = title;
    post.imgUrl = imgUrl;
    post.content = content;
    const result = await post.save();

    // Send message to all connected users
    io.getIO().emit("post event", { action: "update", post: result });

    // Use 201 for adding a new resource
    res.status(200).json({ message: "Post updated", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find the post");
      error.statusCode = 404;
      throw error;
    }
    // Authorize user
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      throw error;
    }
    // Check logged in user
    clearImage(post.imgUrl);
    await Post.findByIdAndRemove(postId);

    // console.log(result); ///
    const user = await User.findById(req.userId);

    // Remove relation with post
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit("post event", { action: "delete", post: postId });

    res.status(200).json({ message: "Removed post" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, "../..", filePath);
  // Delete file
  fs.unlink(filePath, err => console.log(err));
};
