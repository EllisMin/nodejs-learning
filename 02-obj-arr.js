// JS refresher

// Objects
const person = {
  name: "Ellis",
  age: 25,

  greet: function() {
    console.log("Hi I am " + this.name);
  },
  greet2() {
    console.log("Hi I am " + this.name);
  },
  greet3: () => {
    // IMPORTANT: this here refers to global obj
    // thus, this.name is undefined
    console.log("Hi I am " + this.name);
  }
};

// person.greet();
// person.greet2();
// person.greet3(); // this.name is undefined

// Destructuring
// Ex 1
const { name, age } = person;
console.log(name, age);

// Ex 2
const printName = personData => {
  console.log(personData.name);
};
printName(person);
// Only takes the arguments interested in
const printName2 = ({ name, greet2 }) => {
  console.log(name);
  greet2();
};
printName2(person);

// Array
const arr = [3, 2];
// Ex3: destructuring
const [e1, e2] = arr;
console.log(e1, e2);

// Traversing element
// for (let i of arr) {
//   console.log(i);
// }

// Ways to copy array
// 1. slice() copies array without modification like map()
const arrCopy = arr.slice();
// console.log(arrCopy);

// 2. map() transform array (with some modification) and RETURN a new one
// console.log(arr.map(e => "returned array: " + e));

// 3. Spread operator
const arrCopy2 = [...arr];
// console.log(arrCopy2);
const personCopy = { ...person };
// console.log(personCopy);

// x. Returns a new array with first element that's arr i.e. 2d arr
const arrCopy3 = [arr];
// console.log(arrCopy3);

// Rest operator: flexible arguments
const toArr = (...args) => {
  return args;
};
// console.log(toArr(5, 6, 1, 1, 1, 1, 2, 3));
