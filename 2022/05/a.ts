export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const lines = file.toString();

const test_lines = `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2
`;

type Instruction = {
  qty: number;
  from: number;
  to: number;
};

type Puzzle = {
  stacks: number[][];
  instructions: Instruction[];
};

function parseInstructions(operations: string[]) {
  return operations.map((line) => {
    const [_op, qty, _from, from, _to, to] = line
      .split(" ")
      .map((x) => parseInt(x));
    return { qty, from, to };
  });
}

function initializeStacks(stackGraph: string[]) {
  const size = stackGraph.pop().trim().split(/\s+/g).length;
  // Generate empty stacks
  const stacks = Array.from({ length: size + 1 }, () => []);

  let line: string;
  while ((line = stackGraph.pop())) {
    for (let stack = 1; stack < stacks.length; stack++) {
      const char = line[(stack - 1) * 4 + 1];
      if (char && char !== " ") {
        stacks[stack].push(char);
      }
    }
  }
  return stacks;
}

let oldModel = true;

const genratePuzzle = (lines: string): Puzzle => {
  const [stackGraph, operations] = lines.split("\n\n");
  return {
    stacks: initializeStacks(stackGraph.split("\n")),
    instructions: parseInstructions(operations.split("\n")).filter(
      (i) => i.qty
    ),
  };
};

function performInstruction(puzzle: Puzzle, instruction: Instruction) {
  const { qty, from, to } = instruction;

  // Split A & B implementations
  if (oldModel) {
    // Move one item at a time
    let times = qty;
    while (times--) {
      const item = puzzle.stacks[from].pop();
      puzzle.stacks[to].push(item);
    }
  } else {
    // Move all items at once
    const items = puzzle.stacks[from].splice(-qty);
    puzzle.stacks[to].push(...items);
  }
}
const runA = (lines: string) => {
  const puzzle = genratePuzzle(lines);
  puzzle.instructions.forEach((instruction) => {
    performInstruction(puzzle, instruction);
  });

  const finalItems = puzzle.stacks.map((stack) => stack[stack.length - 1]);

  console.log(oldModel ? "A:" : "B:", finalItems.join(""));
};

runA(lines);
oldModel = false;
runA(lines);
