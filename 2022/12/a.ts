export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim().split("\n");

const test_input = `
Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi
`
  .trim()
  .split("\n");

type Point = [number, number];

type Puzzle = {
  map: number[][];
  current: Point;
  destination: Point;
};

function cellValue(char: string): number {
  if (char === "S") char = "a";
  if (char === "E") char = "z";
  return char.charCodeAt(0) - "a".charCodeAt(0);
}

function parseMap(input: string[]): Puzzle {
  const map: number[][] = [];
  let current: Point = [0, 0];
  let destination: Point = [0, 0];
  for (let y = 0; y < input.length; y++) {
    const row = input[y];
    map[y] = [];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char === "S") {
        current = [x, y];
      } else if (char === "E") {
        destination = [x, y];
      }
      map[y][x] = cellValue(char);
    }
  }
  return { map, current, destination };
}

// Thanks copilot for implementing bfs for me, all I had to do was add the
// conditionals around height + 1
function findShortestPath(puzzle: Puzzle): number {
  const { map, current, destination } = puzzle;
  const queue: Point[] = [current];
  const visited = new Set<string>();
  visited.add(current.join(","));
  let steps = 0;
  while (queue.length > 0) {
    const next: Point[] = [];
    for (const [x, y] of queue) {
      if (x === destination[0] && y === destination[1]) {
        return steps;
      }
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= map[0].length || ny >= map.length) {
          continue;
        }
        if (visited.has([nx, ny].join(","))) {
          continue;
        }
        const cell = map[ny][nx];
        if (cell > map[y][x] + 1) {
          continue;
        }
        next.push([nx, ny]);
        visited.add([nx, ny].join(","));
      }
    }
    queue.length = 0;
    queue.push(...next);
    steps++;
  }
  return -1;
}

function run(input: string[]) {
  // ...
  const puzzle = parseMap(input);
  const { map, current, destination } = puzzle;
  console.log(puzzle);

  console.log(findShortestPath(puzzle));

  const startingPoints = puzzle.map
    .map((row, y) =>
      row.map((cell, x) => {
        if (cell === 0) {
          return [x, y];
        }
        return null;
      })
    )
    .flat()
    .filter(Boolean);

  console.log(startingPoints);

  const paths = startingPoints
    .map((point) => {
      const puzzle = { map, current: point as Point, destination };
      return findShortestPath(puzzle);
    })
    .filter((x) => x > 0);

  console.log(paths);
  console.log(Math.min(...paths));
}

run(input);
