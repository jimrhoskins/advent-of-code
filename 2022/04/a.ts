export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const lines = file.toString().trim().split("\n");

const testLines = `
2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8
`
  .trim()
  .split("\n");

type Shift = {
  start: number;
  end: number;
};

const parseShift = (shift: string): Shift => {
  const [start, end] = shift.split("-").map((s) => parseInt(s, 10));
  return { start, end };
};

const parseLine = (line: string) => {
  return line.split(",").map(parseShift);
};

const shiftContained = (outer: Shift, inner: Shift): boolean =>
  outer.start <= inner.start && outer.end >= inner.end;

const shiftsOverlap = (a: Shift, b: Shift) => {
  return (
    (b.start >= a.start && b.start <= a.end) ||
    (a.start >= b.start && a.start <= b.end)
  );
};

const runA = (lines: string[]) => {
  const count = lines
    .map(parseLine)
    .filter(([a, b]) => shiftContained(a, b) || shiftContained(b, a)).length;
  console.log("A: ", count);
};

const runB = (lines: string[]) => {
  const count = lines
    .map(parseLine)
    .filter(([a, b]) => shiftsOverlap(a, b)).length;
  console.log("B: ", count);
};
runA(lines);
runB(lines);
