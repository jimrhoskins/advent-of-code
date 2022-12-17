export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim().split("\n");

const test_input = `
R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2
`
  .trim()
  .split("\n");

type Point = { x: number; y: number };
type Rope = Point[];
let rope: Rope = [];
let tailPoints: Point[] = [{ x: 0, y: 0 }];

const ROPE_LENGTH = 10;

type Direction = "D" | "U" | "L" | "R";
type Instruction = { direction: Direction; distance: number };

const parseInstruction = (instruction: string): Instruction => {
  const direction = instruction[0] as Direction;
  const distance = parseInt(instruction.slice(1));
  return { direction, distance };
};

const performSingleStep = (direction: Direction) => {
  const head = rope[0];
  switch (direction) {
    case "D":
      head.y -= 1;
      break;
    case "U":
      head.y += 1;
      break;
    case "L":
      head.x -= 1;
      break;
    case "R":
      head.x += 1;
      break;
  }

  console.log({ head }, direction);
  updateRope(1);
};

const updateRope = (index: number) => {
  if (index >= rope.length) {
    return;
  }
  const head = rope[index - 1];
  const tail = rope[index];

  const delta = { x: head.x - tail.x, y: head.y - tail.y };
  if (Math.abs(delta.x) <= 1 && Math.abs(delta.y) <= 1) {
    console.log("no need to update tail", { delta });
    return;
  } else if (delta.x === 0) {
    // 2 steps in y direction
    if (Math.abs(delta.y) === 2) {
      tail.y += Math.sign(delta.y);
    }
  } else if (delta.y === 0) {
    // 2 steps in x direction
    if (Math.abs(delta.x) === 2) {
      tail.x += Math.sign(delta.x);
    }
  } else {
    // Off by 2,1 so move diagonally closer
    tail.x += Math.sign(delta.x);
    tail.y += Math.sign(delta.y);
  }

  // console.log("updated tail", { tail });

  if (index === rope.length - 1) {
    tailPoints.push({ ...tail });
    return;
  }

  return updateRope(index + 1);
};

const countUniquePoints = (points: Point[]) => {
  const set = new Set();
  points.forEach((p) => set.add(`${p.x},${p.y}`));
  return set.size;
};

const performInstruction = (instruction: Instruction) => {
  const { direction, distance } = instruction;
  for (let i = 0; i < distance; i++) {
    performSingleStep(direction);
  }
};

const runA = (input: string[]) => {
  for (let i = 0; i < ROPE_LENGTH; i++) {
    rope.push({ x: 0, y: 0 });
  }

  const instructions = input.map(parseInstruction);
  instructions.forEach(performInstruction);
  const head = { ...rope[0] };
  const tail = { ...rope[ROPE_LENGTH - 1] };
  console.log({ head, tail, tailPoints });
  console.log("A:", countUniquePoints(tailPoints));
};

const runB = (input: string[]) => {};

runA(input);
