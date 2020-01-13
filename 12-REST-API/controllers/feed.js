const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      // Status code 200 is default
      res.status(200).json({ message: "Fetched posts", posts: posts });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postPost = (req, res, next) => {
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
    creator: "Ellis"
  });

  post
    .save()
    .then(result => {
      console.log(result); ///
      // Create post in db; Status 201 is to tell resource is created, successfully
      res.status(201).json({
        message: "Post created",
        post: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        error.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      // Error handling
      if (!post) {
        const error = new Error("Could not find the post");
        err.statusCode = 404;
        // Passed down to catch()
        throw error;
      }
      res.status(200).json({ message: "Post fetched", post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        error.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
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

  // Update in db
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find the post");
        error.statusCode = 404;
        // Passed down to catch()
        throw error;
      }
      if (imgUrl !== post.imgUrl) {
        clearImage(post.imgUrl);
      }
      post.title = title;
      post.imgUrl = imgUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      // Use 201 for adding a new resource
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find the post");
        error.statusCode = 404;
        throw error;
      }
      // Check logged in user
      clearImage(post.imgUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      console.log(result); ///
      res.status(200).json({ message: "Removed post" });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, "../..", filePath);
  // Delete file
  fs.unlink(filePath, err => console.log(err));
};
