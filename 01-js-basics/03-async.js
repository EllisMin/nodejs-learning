// JS Refresher

// Not recommended
// const fetchData = callback => {
//   setTimeout(() => {
//     callback("DONE");
//   }, 1500);
// };

// Using promise prevents nested calls and promotes better management and error handling
const fetchData2 = () => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("DONE");
    }, 1500);
  });
  return promise;
};

// Asynchronous
setTimeout(() => {
  // Call back function; should be called later
  console.log("Time is up");

  //   fetchData(text => {
  //     console.log(text);
  //     fetchData(text2 => {
  //       console.log(text2);
  //     });
  //   });

  // More readable than above nested by useing promise
  fetchData2()
    .then(text => {
      console.log(text);
      return fetchData2();
    })
    .then(text2 => {
      console.log(text2);
    });
}, 1000);

// Synchronous; no delay
console.log("HEY");
