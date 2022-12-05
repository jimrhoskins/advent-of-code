export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const lines = file.toString().split("\n");

const OP_CHOICE = "ABC";
const ME_CHOICE = "XYZ";
const CHOICE_SCORES = "_XYZ";
const WINLOSS = [3, 0, 6];

function scoreGameLine(line: string) {
  if (line.length != 3) return 0;

  const [them, me] = line.split(" ");
  const choiceScore = CHOICE_SCORES.indexOf(me);

  const result = (OP_CHOICE.indexOf(them) - ME_CHOICE.indexOf(me) + 6) % 3;
  const resScore = WINLOSS[result];
  console.log({ them, me, choiceScore, result, resScore });
  return choiceScore + resScore;
}

function scoreGameLine2(line: string) {
  if (line.length != 3) return 0;

  const [them, finish] = line.split(" ");
  const resScore = { X: 0, Y: 3, Z: 6 }[finish];
  const index = OP_CHOICE.indexOf(them) + 3;
  const me = ME_CHOICE[(index + ME_CHOICE.indexOf(finish) - 1) % 3];
  const choiceScore = CHOICE_SCORES.indexOf(me);

  console.log({ them, resScore, index, me, choiceScore });
  return resScore + choiceScore;
}
console.log(scoreGameLine2("C X"));
console.log(scoreGameLine2("C Y"));
console.log(scoreGameLine2("C Z"));

// const total = lines.map(scoreGameLine).reduce((a, b) => a + b, 0);
// console.log(total);

const total = lines.map(scoreGameLine2).reduce((a, b) => a + b, 0);
console.log(total);
