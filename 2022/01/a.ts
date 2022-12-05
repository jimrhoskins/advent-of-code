export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./a.txt");
const lines = file.toString().split("\n");

let elves: number[] = [];
let current = 0;

lines.forEach((line) => {
  if (line === "") {
    elves.push(current);
    current = 0;
  } else {
    current += parseInt(line, 10);
  }
});
elves.push(current);

//A
console.log("A: ", Math.max(...elves));

//B
const top = elves
  .sort((a, b) => b - a)
  .slice(0, 3)
  .reduce((a, b) => a + b, 0);

console.log("B: ", top);
