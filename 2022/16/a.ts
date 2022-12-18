export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim();

const test_input = `
Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II
`.trim();

const READING_REGEX =
  /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/;

function parseInput(input: string) {
  const lines = input.split("\n");
  const valves: Map<string, Valve> = new Map();
  for (const line of lines) {
    const [, name, flowRate, tunnels] = line.match(READING_REGEX);
    const valve = new Valve(name, parseInt(flowRate));
    valves.set(name, valve);
  }
  for (const line of lines) {
    const [, name, flowRate, tunnels] = line.match(READING_REGEX);
    const valve = valves.get(name);
    for (const tunnel of tunnels.split(", ")) {
      valve.tunnels.push(valves.get(tunnel));
    }
  }
  return valves;
}

class Valve {
  name: string;
  flowRate: number;
  tunnels: Valve[] = [];
  constructor(name: string, flowRate: number) {
    this.name = name;
    this.flowRate = flowRate;
  }
}

const DP = new Map<string, number>();

type Score = {
  value: number;
  openValves: string[];
};

const scores = new Map<string, Score>();

// Brute force possible paths, and use DP to memoize. Still slow, but fast enough
// to solve the problem.
// Pass the score down recursively so the end results can be stored for part 2.
function f(
  start: Valve,
  timeLimit: number,
  openValves: string[] = [],
  score: number = 0
) {
  // Memoize based on the arguments
  const key = start.name + timeLimit + openValves.sort().join("") + score;

  if (timeLimit === 0) {
    // Store the best solution for a resulting set of open valves
    const storeKey = openValves.sort().join("") + score;
    const existingScore = scores.get(storeKey);

    if (existingScore && existingScore.value > score) return 0;

    scores.set(storeKey, { value: score, openValves: [...openValves] });
    return 0;
  }

  if (DP.has(key)) return DP.get(key);
  let max = 0;

  // Try opening the current valve, if possible
  if (start.flowRate > 0 && !openValves.includes(start.name)) {
    max =
      (timeLimit - 1) * start.flowRate +
      f(
        start,
        timeLimit - 1,
        [...openValves, start.name],
        score + (timeLimit - 1) * start.flowRate
      );
  }

  // Compare opening self vs traveling to a neighbor
  for (const valve of start.tunnels) {
    const totalValue = f(valve, timeLimit - 1, openValves, score);
    if (totalValue > max) {
      max = totalValue;
    }
  }

  DP.set(key, max);
  return max;
}

function isDisjoint(a: string[], b: string[]) {
  return a.filter((x) => b.includes(x)).length === 0;
}

function run(valves: Map<string, Valve>, timeLimit: number = 30) {
  const start = valves.get("AA");

  // Part A
  // const x = f(start, timeLimit);
  // console.log(x);

  // Part B
  const x = f(start, 26);
  console.log(x);

  // Sort the scores by value so we can return early in search
  const bestScores = Array.from(scores.values()).sort(
    (a, b) => b.value - a.value
  );
  console.log("length", bestScores.length);

  // Compare all the scores to find the best combination with
  // no overlap in open valves, one is the player, the other is the elephant
  const best = { value: 0, openValves: [] };
  for (let x = 0; x < bestScores.length; x++) {
    // The inner loop will always be smaller than the outer loop, so we can
    // return early if we won't find a better score
    if (bestScores[x].value * 2 < best.value) break;

    inner: for (let y = x + 1; y < bestScores.length; y++) {
      const score1 = bestScores[x];
      const score2 = bestScores[y];
      const value = score1.value + score2.value;

      // If the value is less than the best we've found, we can stop the inner loop
      if (value < best.value) break inner;
      if (isDisjoint(score1.openValves, score2.openValves)) {
        if (value > best.value) {
          best.value = value;
          best.openValves = [...score1.openValves, ...score2.openValves];
        }
      }
    }
  }
  console.log(best);
}

run(parseInput(input));
