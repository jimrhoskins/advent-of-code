export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim().split("\n\n");

const test_input = `
Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1
`
  .trim()
  .split("\n\n");

let divideWorry = true;
const debug = false;
let lcm: number;

class Monkey {
  name: string;
  items: number[] = [];
  operation: string;
  inspectionCount: number = 0;
  divTest: number = 0;
  trueDest: number = 0;
  falseDest: number = 0;

  constructor(definition: string) {
    debug && console.log({ definition });

    const lines = definition.split("\n");
    this.name = lines[0].split(":")[0].trim();
    this.items = lines[1]
      .split(":")[1]
      .trim()
      .split(",")
      .map((x) => parseInt(x));

    this.operation = lines[2].split("=")[1].trim();

    this.divTest = parseInt(lines[3].split("by")[1].trim());
    this.trueDest = parseInt(lines[4].split("monkey")[1].trim());
    this.falseDest = parseInt(lines[5].split("monkey")[1].trim());
  }

  inspectAll() {
    while (this.items.length > 0) {
      this.inspect(this.items.shift());
    }
  }

  inspect(item: number) {
    this.inspectionCount++;
    let worryLevel = item;
    worryLevel = eval(this.operation.replace(/old/g, worryLevel.toString()));
    debug && console.log({ name: this.name, worryLevel });

    // A and B conditions
    if (divideWorry) {
      worryLevel = Math.floor(worryLevel / 3);
      debug && console.log({ name: this.name, worryLevel });
    } else {
      worryLevel = worryLevel % lcm;
      debug && console.log({ name: this.name, worryLevel });
    }

    if (worryLevel % this.divTest === 0) {
      debug && console.log(this.name, "Throwing to ", this.trueDest);
      // throw to trueDest
      monkeys[this.trueDest].items.push(worryLevel);
    } else {
      debug && console.log(this.name, "Throwing to ", this.falseDest);
      // throw to falseDest
      monkeys[this.falseDest].items.push(worryLevel);
    }
  }

  print() {
    return `${this.name} inspected ${this.inspectionCount} items`;
  }
}

let monkeys: Monkey[] = [];

function run(lines: string[], rounds: number, label: string) {
  monkeys = lines.map((line) => new Monkey(line));
  lcm = monkeys.reduce((a, b) => a * b.divTest, 1);

  for (let i = 0; i < rounds; i++) {
    monkeys.forEach((monkey) => monkey.inspectAll());
  }
  console.log(monkeys.map((m) => m.print()));
  const inspections = monkeys
    .map((m) => m.inspectionCount)
    .sort((a, b) => b - a);

  console.log(label, inspections[0] * inspections[1]);
}
function runA(lines: string[]) {
  divideWorry = true;
  run(lines, 20, "A:");
}
function runB(lines: string[]) {
  divideWorry = false;
  run(lines, 10000, "B:");
}

runA(input);
runB(input);
