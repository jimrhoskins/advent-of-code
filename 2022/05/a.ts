export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const lines = file.toString().trim().split("\n");

const test_lines = `
`
  .trim()
  .split("\n");

type Shift = {
  start: number;
  end: number;
};

const runA = (lines: string[]) => {
  console.log("A:");
};

const runB = (lines: string[]) => {
  console.log("B:");
};
runA(lines);
runB(lines);
