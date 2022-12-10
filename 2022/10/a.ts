export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim().split("\n");

const test_input = `
addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop
`
  .trim()
  .split("\n");

type Instruction = {
  op: string;
  val: number;
};

type Snapshot = {
  x: number;
  cycle: number;
  instruction: Instruction;
};

type Machine = {
  x: number;
  cycle: number;
  instructions: Instruction[];
  snapshots: Snapshot[];
};

function parseInstructions(input: string[]): Instruction[] {
  return input.map((line) => {
    const [op, val] = line.split(" ");
    return { op, val: parseInt(val, 10) };
  });
}

function takeSnapshot(machine: Machine): void {
  machine.snapshots.push({
    x: machine.x,
    cycle: machine.cycle,
    instruction: machine.instructions[0],
  });
}

function runInstruction(machine: Machine): boolean {
  if (machine.instructions.length === 0) {
    return false;
  }

  const { op, val } = machine.instructions[0];
  if (op === "addx") {
    machine.cycle += 1;
    takeSnapshot(machine);
    machine.cycle += 1;
    takeSnapshot(machine);
    machine.x += val;
  } else if (op === "noop") {
    machine.cycle += 1;
    takeSnapshot(machine);
  } else {
    throw new Error(`Unknown op ${op}`);
  }

  machine.instructions = machine.instructions.slice(1);

  return true;
}

function calculateSignalStrength(snapshots: Snapshot[]): number {
  let total = 0;

  for (const snapshot of snapshots) {
    if ((snapshot.cycle - 20) % 40 === 0) {
      const strength = snapshot.cycle * snapshot.x;
      //  console.log({ cycle: snapshot.cycle, strength });
      total += strength;
    }
  }

  return total;
}

function renderRow(snapshots: Snapshot[]) {
  const row = snapshots.map((snapshot, col) => {
    if (Math.abs(snapshot.x - col) > 1) {
      return ".";
    }
    return "#";
  });

  console.log(row.join(""));
}

function renderScreen(snapshots: Snapshot[]) {
  snapshots = [...snapshots];
  while (snapshots.length > 0) {
    renderRow(snapshots.splice(0, 40));
  }
}

const runA = (input: string[]) => {
  let machine: Machine = {
    x: 1,
    cycle: 0,
    instructions: parseInstructions(input),
    snapshots: [],
  };

  //console.log({ machine });

  while (runInstruction(machine)) {}

  //console.log(machine.snapshots);

  console.log("A", calculateSignalStrength(machine.snapshots));
  renderScreen(machine.snapshots);
};

runA(input);
