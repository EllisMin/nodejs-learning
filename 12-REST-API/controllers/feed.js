const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  // Status code 200 is default
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imgUrl: "12-REST-API/images/pen.jpeg",
        creator: {
          name: "Ellis"
        },
        createdAt: new Date()
      }
    ]
  });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect",
      errors: errors.array()
    });
  }
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imgUrl: "12-REST-API/images/pen.jpeg",
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
      console.log(err);
    });
};
