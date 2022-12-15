export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim();

const test_input = `
[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]
`.trim();

type Packet = number | Packet[];
type Pair = [Packet, Packet];
const dividers = [[[2]], [[6]]];
const dividerSet = new Set<Packet>(dividers);

const parsePacket = (packet: string): Packet => JSON.parse(packet);
const parseInput = (input: string): Pair[] => {
  const pairs = input.split("\n\n");
  return pairs.map((pair) => {
    const [a, b] = pair.split("\n");
    return [parsePacket(a), parsePacket(b)];
  });
};

enum Result {
  A_FIRST = -1,
  B_FIRST = 1,
  TIE = 0,
}

function comparePackets(a: Packet, b: Packet): Result {
  if (typeof a === "number" && typeof b === "number") {
    return Math.sign(a - b) as Result;
    // if (a < b) return Result.A_FIRST;
    // if (a > b) return Result.B_FIRST;
    // return Result.TIE;
  }

  if (typeof a === "number" && Array.isArray(b)) {
    return comparePackets([a], b);
  }
  if (Array.isArray(a) && typeof b === "number") {
    return comparePackets(a, [b]);
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      if (a[i] === undefined) return Result.A_FIRST;
      if (b[i] === undefined) return Result.B_FIRST;
      const result = comparePackets(a[i], b[i]);
      if (result !== Result.TIE) return result;
    }
  }
  return Result.TIE;
}

function run(pairs: Pair[]) {
  let sum = pairs.reduce((acc, [a, b], i) => {
    return comparePackets(a, b) === Result.A_FIRST ? acc + i + 1 : acc;
  }, 0);
  console.log("A:", sum);
}

function runb(pairs: Pair[]) {
  const packets = [...pairs.flat(), ...dividers];
  packets.sort(comparePackets);

  let product = packets.reduce((prod: number, packet, i) => {
    return dividerSet.has(packet) ? prod * (i + 1) : prod;
  }, 1);
  console.log("B:", product);
}

run(parseInput(input));
runb(parseInput(input));
