export const __ = "";
import * as fs from "fs";
import { maxHeaderSize } from "http";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim();

const test_input = `
>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>
`.trim();

const WIDTH = 7;
type Space = boolean;

// Tilt your head to the right to see shape defined with origin at bottom left
const SHAPE_DEFS = (function () {
  const _ = undefined as undefined;
  const $ = true;
  return {
    MINUS: [
      [$], //
      [$], //
      [$], //
      [$],
    ],
    PLUS: [
      [_, $, _],
      [$, $, $],
      [_, $, _],
    ],
    ANGLE: [
      [$, _, _],
      [$, _, _],
      [$, $, $],
    ],
    POLE: [
      [$, $, $, $], // stands vertically
    ],
    SQUARE: [
      [$, $],
      [$, $],
    ],
  } as const;
})();
type Shape = typeof SHAPE_DEFS[keyof typeof SHAPE_DEFS];
const ShapePattern = Object.keys(SHAPE_DEFS) as (keyof typeof SHAPE_DEFS)[];

class Rock {
  public readonly height: number;
  public readonly width: number;

  constructor(
    public readonly shape: Shape,
    public x: number,
    public y: number
  ) {
    this.height = Math.max(...shape.map((col) => col.length - 1));
    this.width = this.shape.length;
  }

  // Uses it's own coordinates and shape definition to determine if it covers a given point
  covers(col: number, row: number) {
    return Boolean(this.shape[col - this.x]?.[row - this.y]);
  }

  // Useful for render() to know where to start drawing
  maxHeight() {
    return this.y + this.height;
  }
}

type LoopRecord = {
  rocksDropped: number;
  height: number;
};

type LoopReport = {
  prev: LoopRecord;
  current: LoopRecord;
};

class Simulation {
  map: Space[][];

  jetPattern: string[];
  jetIndex: number = 0;

  rockCount: number = 0;
  rock?: Rock;

  memo: Map<string, LoopRecord> = new Map();

  constructor(input: string, public detectLoops = false) {
    if (!input.match(/^[<>]+$/)) throw new Error("Invalid input");
    this.jetPattern = input.split("");

    this.map = new Array(WIDTH).fill(0).map(() => []);
  }

  get height() {
    return Math.max(...this.map.map((col) => col.length));
  }

  spawnRock() {
    const shape =
      SHAPE_DEFS[ShapePattern[this.rockCount % ShapePattern.length]];
    const x = 2;
    const y = this.height + 3;
    this.rock = new Rock(shape, x, y);
    this.rockCount++;
  }

  simulateRock(render = false): LoopReport | null {
    // Part B: The states this simulation can reach are periodic
    // as a function of which rock is being dropped and where in the
    // jet pattern we are. This means that if we detect a loop, we can
    // stop the simulation and calculate the height at any rock after our
    // first loop.
    if (this.detectLoops) {
      const key = this.calculateSkyline();
      if (this.memo.has(key)) {
        return {
          prev: this.memo.get(key),
          current: { rocksDropped: this.rockCount, height: this.height },
        };
      }
      this.memo.set(key, { rocksDropped: this.rockCount, height: this.height });
    }
    // End Part B specific code

    this.spawnRock();
    render && this.render();
    if (!this.rock) throw new Error("No rock");

    while (true) {
      const jet = this.nextJet();

      // Push rock and measure if it is OOB or intersects with existing rocks
      // If it does, undo the push and continue
      this.rock.x += jet;
      if (this.rockOutOfBounds() || this.rockIntersects()) {
        this.rock.x -= jet;
      }
      render && this.render();

      // Move down, if it intersects, undo the move and and place the rock
      this.rock.y -= 1;
      if (this.rockIntersects()) {
        this.rock.y += 1;
        this.placeRock();
        render && this.render();
        break;
      }
      render && this.render();
    }
    return null;
  }

  // Take the positions occupied by the current rock in its current position
  // and fill the map in those spots. then remove the rock
  placeRock() {
    if (!this.rock) throw new Error("No rock");

    for (let col = 0; col < WIDTH; col++) {
      for (let row = this.rock.y; row <= this.rock.maxHeight(); row++) {
        if (this.rock.covers(col, row)) {
          this.map[col][row] = true;
        }
      }
    }
    this.rock = undefined;
  }

  // Returns the delta x for the next jet gust
  nextJet(): number {
    const jet = this.jetPattern[this.jetIndex];
    this.jetIndex = (this.jetIndex + 1) % this.jetPattern.length;
    return jet === "<" ? -1 : 1;
  }

  // Determine if the rock intersects with any existing rocks or the floor
  rockIntersects(): boolean {
    if (!this.rock) return false;
    if (this.rock.y < 0) return true;
    for (let col = 0; col < WIDTH; col++) {
      for (let row = this.rock.y; row <= this.rock.maxHeight(); row++) {
        if (this.rock.covers(col, row) && this.map[col][row]) {
          return true;
        }
      }
    }
    return false;
  }

  // Determine if the rock intersects with the walls
  rockOutOfBounds(): boolean {
    if (!this.rock) return false;
    return this.rock.x < 0 || this.rock.x + this.rock.width > WIDTH;
  }

  render() {
    const height = Math.max(this.height, this.rock?.maxHeight() ?? 0, 4);
    const output = [`+${"-".repeat(WIDTH)}+`];
    for (let y = 0; y <= height; y++) {
      const row = this.map
        .map((col, x) => {
          return this.rock?.covers(x, y) ? "@" : col[y] ? "#" : ".";
        })
        .join("");
      output.push(`|${row}|`);
    }
    console.log(output.reverse().join("\n"));

    console.log({
      intersects: this.rockIntersects(),
      outOfBounds: this.rockOutOfBounds(),
      height: this.height,
      totalHeight: this.totalHeight,
    });
    console.log("-".repeat(80));
  }

  // Key for memoization and loop detection
  // The first 7 values are the skyline, measured from the highest point in
  // each column relative to the highest column point. The last two values
  // are the rock count and the jet index. If these are the same values
  // the behavior of the rock will be the same, and will loop from there.
  calculateSkyline() {
    const skyline = this.map.map((col) => {
      return this.height - col.lastIndexOf(true);
    });
    skyline.push(this.rockCount % ShapePattern.length);
    skyline.push(this.jetIndex % this.jetPattern.length);
    return skyline.join(",");
  }

  // This ended up being a bad path. Naievely I thought part b the problem
  // would be space constraint and not time constraint. I was wrong.
  // Truncating the map would have worked, but it would have taken forever
  // Cool thingy, but not helpful ¯\_(ツ)_/¯
  floorHeight: number = 0;
  truncate() {
    let height = 0;
    for (let y = this.height - 1; y >= 0; y--) {
      if (this.map.every((col) => col[y] || col[y + 1])) {
        height = y;
        break;
      }
    }
    console.log(`truncating at ${height}`);
    for (let col = 0; col < WIDTH; col++) {
      this.map[col] = this.map[col].slice(height);
    }
    this.floorHeight += height;
  }

  // Also not used, but was used in my attempt at truncating the map
  get totalHeight() {
    return this.height + this.floorHeight;
  }
}

// Part A
function run(input: string, ROCKS: number) {
  const sim = new Simulation(input);
  for (let i = 0; i < ROCKS; i++) {
    sim.simulateRock(!true);
  }
  sim.render();
  console.log(sim.height);
}

function runb(input: string, ROCKS: number) {
  // First run the simulation until a loop is found
  const sim = new Simulation(input, true);
  let result: LoopReport;
  for (let i = 0; i < ROCKS; i++) {
    result = sim.simulateRock(!true);
    if (result) break;
  }
  console.log(result);
  console.log(sim.totalHeight);

  // Now we have enough information to calculate any rock number.
  const { prev, current } = result;
  const target = ROCKS;

  const period = current.rocksDropped - prev.rocksDropped;
  const offset = prev.rocksDropped;

  // The loop doesn't start untill the beginning of the first detected loop
  // so we need to offset the target by the number of rocks dropped before
  // and we'll add it back in later
  const offsetTarget = target - offset;

  const targetRemainder = offsetTarget % period;
  const targetProduct = Math.floor(offsetTarget / period);

  // This is the reduced target rock to find in a simulation that matches
  // the offsetTarget rock; We need to add the offset back in because
  // it isn't part of the loop.
  const targetRock = offset + targetRemainder;

  // We need to calulate the height of the loops we'll be skipping over
  // So find the height difference per loop and multiply by the number
  // of skipped loops
  const heightDiff = current.height - prev.height;
  const skippedHeight = targetProduct * heightDiff;

  console.log({
    heightDiff,
    offset,
    period,
    targetRemainder,
    targetProduct,
    targetRock,
    skippedHeight,
  });

  // Now we can run the simulation again, but only run it to the target rock
  const sim2 = new Simulation(input);
  for (let i = 0; i < targetRock; i++) {
    sim2.simulateRock(!true);
  }

  // And add the skipped height to the final height for the final anser
  console.log("final height", skippedHeight + sim2.height);
}

//run(test_input, 2022);
//run(input, 2022);

//run(test_input, 1000000000000);
runb(input, 1000000000000);
