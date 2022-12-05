export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const lines = file.toString().split("\n");

const testLines = `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`.split("\n");

const bisect = (input: string) => [
  input.slice(0, input.length / 2),
  input.slice(input.length / 2),
];

const typePriority = (char: string) => {
  const rawValue = char.charCodeAt(0);
  if (rawValue >= 97) {
    return rawValue - 96;
  }
  return rawValue - 38;
};

const firstIntersect = (a: string, b: string) => {
  const setA = new Set(a.split(""));
  return b.split("").find((bChar) => setA.has(bChar));
};

const getSackPriority = (sack: string) => {
  if (!sack) return 0;
  const [left, right] = bisect(sack);
  const shared = firstIntersect(left, right);
  const priority = typePriority(shared);
  return priority;
};

const findCommonItem = (a: string, b: string, c: string) => {
  const setA = new Set(a.split(""));
  const setB = new Set(b.split(""));
  return c.split("").find((x) => setA.has(x) && setB.has(x));
};

const runA = (lines: string[]) => {
  const total = lines.map(getSackPriority).reduce((a, b) => a + b, 0);
  console.log("A: ", total);
};

const runB = (lines: string[]) => {
  let sum = 0;
  while (lines.length >= 3) {
    const common = findCommonItem(lines.shift(), lines.shift(), lines.shift());
    sum += typePriority(common);
  }

  console.log("B: ", sum);
};

runA(lines);
runB(lines);
