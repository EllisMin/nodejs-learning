const sum = (a, b) => {
  if (a && b) {
    return a + b;
  }
  // Comes with express-validator
  throw new Error("Invalid arguments");
};

try {
  console.log(sum(1));
} catch (err) {
  console.log("Error occurred");
  // Handle the error here; app doesn't crash
//   console.log(err);
}
