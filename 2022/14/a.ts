export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim();

const test_input = `
498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`.trim();

enum Material {
  rock = 1,
  sand = 2,
  air = 3,
}

type Point = {
  x: number;
  y: number;
};

function numSort(a: number, b: number) {
  return a - b;
}

class Cave {
  map: Map<string, Material>;
  source: Point;
  abyssY: number = 0;
  totalSand: number = 0;
  useFloor: boolean;

  constructor(structure: string, useFloor = false) {
    this.map = new Map();
    this.source = { x: 500, y: 0 };
    this.loadStructure(structure);
    this.useFloor = useFloor;
  }

  loadStructure(structure: string) {
    const lines = structure.split("\n");
    lines.forEach((line, y) => {
      const points = line.split(" -> ");
      for (let i = 0; i < points.length - 1; i++) {
        let [x1, y1] = points[i].split(",").map(Number);
        let [x2, y2] = points[i + 1].split(",").map(Number);
        [x1, x2] = [x1, x2].sort(numSort);
        [y1, y2] = [y1, y2].sort(numSort);

        this.abyssY = Math.max(this.abyssY, y2);

        for (let x = x1; x <= x2; x++) {
          for (let y = y1; y <= y2; y++) {
            this.map.set(`${x},${y}`, Material.rock);
          }
        }
      }
    });
  }

  dropSandUntilFull() {
    while (
      this.dropOneSand() &&
      this.materialAt(this.source.x, this.source.y) === Material.air
    ) {}
  }

  // Drop one sand unit at the source, return true if it comes to rest, false if it falls into the abyss
  dropOneSand(): boolean {
    let x = this.source.x;
    let y = this.source.y;
    while (true) {
      if (!this.useFloor && y > this.abyssY) return false;

      const below = this.materialAt(x, y + 1);
      if (below === Material.air) {
        y++;
        continue;
      }
      // check if we can fall down diagonally left or right
      const left = this.materialAt(x - 1, y + 1);
      const right = this.materialAt(x + 1, y + 1);
      if (left === Material.air) {
        x--;
        y++;
        continue;
      }
      if (right === Material.air) {
        x++;
        y++;
        continue;
      }
      this.map.set(`${x},${y}`, Material.sand);
      this.totalSand++;
      return true;
    }
  }

  materialAt(x: number, y: number): Material {
    if (y == this.abyssY + 2) return Material.rock;
    return this.map.get(`${x},${y}`) ?? Material.air;
  }
}

function run(input: string, useFloor = false) {
  const cave = new Cave(input, useFloor);
  console.log(cave);
  cave.dropSandUntilFull();
  console.log("A:", cave.totalSand);
}

//run(test_input);
run(input, true);
//runb(parseInput(input));
