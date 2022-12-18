export const __ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim();

const test_input = `
2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5
`.trim();

type Cube = {
  key: string;
  x: number;
  y: number;
  z: number;
};

function newCube(x: number, y: number, z: number): Cube {
  return {
    key: `${x},${y},${z}`,
    x,
    y,
    z,
  };
}

const lava = new Map<string, Cube>();
const outside = new Map<string, Cube>();

const bounds = {
  x: { min: Infinity, max: -Infinity },
  y: { min: Infinity, max: -Infinity },
  z: { min: Infinity, max: -Infinity },
};

function updateBounds(cube: Cube) {
  bounds.x.min = Math.min(bounds.x.min, cube.x);
  bounds.x.max = Math.max(bounds.x.max, cube.x);
  bounds.y.min = Math.min(bounds.y.min, cube.y);
  bounds.y.max = Math.max(bounds.y.max, cube.y);
  bounds.z.min = Math.min(bounds.z.min, cube.z);
  bounds.z.max = Math.max(bounds.z.max, cube.z);
}

function outOfBounds(key: string) {
  const [x, y, z] = key.split(",").map(Number);
  return (
    x < bounds.x.min ||
    x > bounds.x.max ||
    y < bounds.y.min ||
    y > bounds.y.max ||
    z < bounds.z.min ||
    z > bounds.z.max
  );
}

// Use BFS to find all the outside cubes starting at a known outside cube
// Fill `outside` with all the outside cubes
function fillOutside() {
  const queue = [newCube(bounds.x.min, bounds.y.min, bounds.z.min)];

  while (queue.length) {
    const cube = queue.shift()!;

    if (outside.has(cube.key)) continue;
    if (lava.has(cube.key)) continue;
    if (outOfBounds(cube.key)) continue;

    outside.set(cube.key, cube);
    neighborCoords(cube).forEach((coords) => {
      queue.push(newCube(...coords));
    });
  }
}

function parseInput(input: string) {
  const lines = input.split("\n");
  return lines.map((line, y) => {
    const nums = line.split(",").map(Number);
    const cube = {
      key: line,
      x: nums[0],
      y: nums[1],
      z: nums[2],
    };
    lava.set(cube.key, cube);
    updateBounds(cube);
    return cube;
  });
}

type Coord = [number, number, number];

function neighborCoords(cube: Cube): Coord[] {
  const { x, y, z } = cube;
  return [
    [x - 1, y, z],
    [x + 1, y, z],
    [x, y - 1, z],
    [x, y + 1, z],
    [x, y, z - 1],
    [x, y, z + 1],
  ];
}

function neighborKeys(cube: Cube): string[] {
  return neighborCoords(cube).map((coords) => coords.join(","));
}

function run(input: string) {
  const cubes = parseInput(input);

  // Part 1
  const surface = cubes.reduce(
    (acc, cube) =>
      neighborKeys(cube).reduce(
        (acc, key) => (!lava.has(key) ? acc + 1 : acc),
        acc
      ),
    0
  );

  console.log("Part 1:", surface);

  // Part 2
  // Push bounds outward one to fill with "outside" cubes
  bounds.x.min--;
  bounds.x.max++;
  bounds.y.min--;
  bounds.y.max++;
  bounds.z.min--;
  bounds.z.max++;

  // Create outside cubes
  fillOutside();

  // Loop through all the lava, for each outside cube it touches,
  // it must be exposed to the outside and increase its outside surface area
  const outerSurface = cubes.reduce(
    (acc, cube) =>
      neighborKeys(cube).reduce(
        (acc, key) => (outside.has(key) ? acc + 1 : acc),
        acc
      ),
    0
  );
  console.log("Part 2:", outerSurface);
}

//run(test_input);
run(input);
