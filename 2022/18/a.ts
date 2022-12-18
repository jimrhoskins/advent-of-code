export const __ = "";
import * as fs from "fs";

const puzzle_input = fs.readFileSync("./input.txt").toString().trim();
const sample_input = `
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
type Coord = [number, number, number];

class Simulation {
  lava = new Map<string, Cube>();
  outside = new Map<string, Cube>();
  cubes: Cube[] = [];

  bounds = {
    x: { min: Infinity, max: -Infinity },
    y: { min: Infinity, max: -Infinity },
    z: { min: Infinity, max: -Infinity },
  };

  constructor(input: string, public readonly name: string) {
    this.parseInput(input);
  }

  parseInput(input: string) {
    const { lava } = this;
    const lines = input.split("\n");
    this.cubes = lines.map((line, y) => {
      const nums = line.split(",").map(Number);
      const cube = {
        key: line,
        x: nums[0],
        y: nums[1],
        z: nums[2],
      };
      lava.set(cube.key, cube);
      this.updateBounds(cube);
      return cube;
    });
  }

  updateBounds(cube: Cube) {
    const {
      bounds: { x, y, z },
    } = this;
    x.min = Math.min(x.min, cube.x);
    x.max = Math.max(x.max, cube.x);
    y.min = Math.min(y.min, cube.y);
    y.max = Math.max(y.max, cube.y);
    z.min = Math.min(z.min, cube.z);
    z.max = Math.max(z.max, cube.z);
  }
  outOfBounds(key: string) {
    const { bounds } = this;
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

  fillOutside() {
    const { outside, bounds, lava } = this;
    const queue = [newCube(bounds.x.min, bounds.y.min, bounds.z.min)];

    while (queue.length) {
      const cube = queue.shift()!;

      if (outside.has(cube.key)) continue;
      if (lava.has(cube.key)) continue;
      if (this.outOfBounds(cube.key)) continue;

      outside.set(cube.key, cube);
      neighborCoords(cube).forEach((coords) => {
        queue.push(newCube(...coords));
      });
    }
  }

  // Part 1, find all lava faces thaty are not touching another lava cube
  findSurfaceArea() {
    const { cubes, lava, name } = this;

    const surface = cubes.reduce(
      (acc, cube) =>
        neighborKeys(cube).reduce(
          (acc, key) => (!lava.has(key) ? acc + 1 : acc),
          acc
        ),
      0
    );

    console.log(name, "Part 1:", surface);
  }

  // Part 2, fill the outside with "outside" cubes, then find all lava cubes
  // that are touching an outside cube
  findExternalSurfaceArea() {
    const { cubes, name, outside, bounds } = this;
    // Push bounds outward one to fill with "outside" cubes
    bounds.x.min--;
    bounds.x.max++;
    bounds.y.min--;
    bounds.y.max++;
    bounds.z.min--;
    bounds.z.max++;

    // Create outside cubes
    this.fillOutside();

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
    console.log(name, "Part 2:", outerSurface);
  }
}

function newCube(x: number, y: number, z: number): Cube {
  return {
    key: `${x},${y},${z}`,
    x,
    y,
    z,
  };
}

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

function run(input: string, name: string) {
  const sim = new Simulation(input, name);

  // Part 1
  sim.findSurfaceArea();

  // Part 2
  sim.findExternalSurfaceArea();
}

run(sample_input, "Sample");
run(puzzle_input, "Puzzle");
