export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString();

const test_input = `mjqjpqmgbljsphdztnvjfqwrcgsmlb`;

const runA = (input: string) => {
  const chars = input.split("");
  const length = 14;
  for (let i = length; i < chars.length; i++) {
    if (new Set(chars.slice(i - length, i)).size == length) {
      console.log("A: ", i);
      break;
    }
  }
};

runA(input);
