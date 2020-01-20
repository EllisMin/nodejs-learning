const bcrypt = require("bcryptjs");
const User = require("../models/user");

module.exports = {
  // createUser({ userInput }, req){}
  createUser: async function({ userInput }, req) {
    // Option 1 (without destructuring):
    // const email = args.userInput.email;
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
  }
};
