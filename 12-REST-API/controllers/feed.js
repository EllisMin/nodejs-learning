exports.getPosts = (req, res, next) => {
  // Status code 200 is default
  res.status(200).json({
    posts: [{ title: "First Post",
    content: "This is the first post!" }]
  });
};

exports.postPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  console.log(title, content); ///

  // Create pst in db; Status 201 is to tell resource is created, successfully
  res.status(201).json({
    message: "Post created",
    post: { id: new Date().toISOString(),
    title: title, content: content }
  });
};
