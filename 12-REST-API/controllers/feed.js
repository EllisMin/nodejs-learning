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
