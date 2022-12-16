export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim();

const test_input = `
Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3
`.trim();

type Point = {
  x: number;
  y: number;
};

const READING_REGEX =
  /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/;

class Reading {
  sensor: Point;
  beacon: Point;
  distance: number;
  xsAtY: Map<number, number[]> = new Map();
  constructor(line: string, precompute = false) {
    const [, sensorX, sensorY, beaconX, beaconY] = line.match(READING_REGEX);
    this.sensor = { x: parseInt(sensorX), y: parseInt(sensorY) };
    this.beacon = { x: parseInt(beaconX), y: parseInt(beaconY) };

    this.distance =
      Math.abs(this.sensor.x - this.beacon.x) +
      Math.abs(this.sensor.y - this.beacon.y);

    if (precompute) {
      this.precompute();
    }
  }

  precompute() {
    for (
      let y = this.sensor.y - this.distance;
      y <= this.beacon.y + this.distance;
      y++
    ) {
      this.xsAtY.set(y, this.xValuesCoveredAtY(y));
    }
  }

  xValuesCoveredAtY(y: number): number[] {
    if (this.xsAtY?.has(y)) {
      return this.xsAtY.get(y);
    }
    const yDiff = Math.abs(this.sensor.y - y);
    const xDist = this.distance - yDiff;
    let xs: number[] = [];
    for (let x = this.sensor.x - xDist; x <= this.sensor.x + xDist; x++) {
      xs.push(x);
    }
    return xs;
  }

  xRangeCoveredAtY(y: number): [number, number] | null {
    const xDist = this.distance - Math.abs(this.sensor.y - y);
    if (xDist < 0) return null;
    return [this.sensor.x - xDist, this.sensor.x + xDist];
  }
}

function parsePoint(input: string): Point {
  const [x, y] = input
    .slice(input.indexOf("=") + 1)
    .split(",")
    .map((s) => parseInt(s));
  return { x, y };
}

function xRangesCoveredAtY(
  readings: Reading[],
  y: number,
  maxXY: number
): [number, number][] {
  return readings
    .map((reading) => reading.xRangeCoveredAtY(y))
    .filter((range) => range !== null)
    .sort(rangeSort)
    .reduce((acc, [min, max]) => {
      if (max < 0 || min > maxXY) return acc;
      const newRange = [Math.max(0, min), Math.min(max, maxXY)] as [
        number,
        number
      ];
      if (acc.length === 0) {
        acc.push(newRange);
        return acc;
      }

      const prevRange = acc[acc.length - 1];
      if (prevRange[1] >= newRange[0] - 1) {
        prevRange[1] = Math.max(prevRange[1], newRange[1]);
      } else {
        acc.push(newRange);
      }

      return acc;
    }, [] as [number, number][]);
}

function xValuesCoveredAtY(
  readings: Reading[],
  y: number,
  excludeSelf = true
): number[] {
  const xs = new Set<number>();
  for (const reading of readings) {
    for (const x of reading.xValuesCoveredAtY(y)) {
      xs.add(x);
    }
  }

  if (excludeSelf) {
    for (const reading of readings) {
      if (reading.beacon.y === y) {
        xs.delete(reading.beacon.x);
      }
      if (reading.sensor.y === y) {
        xs.delete(reading.sensor.x);
      }
    }
  }
  return Array.from(xs);
}

function parseInput(input: string): string[] {
  return input.split("\n");
}

function run(input: string[], y) {
  const readings = input.map((line) => new Reading(line));
  console.log(readings);
  const xs = xValuesCoveredAtY(readings, y);
  console.log(xs.length);
}

const numSort = (a, b) => a - b;
const rangeSort = (a, b) => a[0] - b[0];
const tuningFreq = (x: number, y: number) => x * 4000000 + y;

function runB(input: string[], minXY, maxXY) {
  const readings = input.map((line) => new Reading(line, false));
  for (let y = minXY; y <= maxXY; y++) {
    const ranges = xRangesCoveredAtY(readings, y, maxXY);
    if (ranges.length > 1) {
      console.log("y", y, ranges);
      const x = ranges[0][1] + 1;
      console.log("tuning freq", tuningFreq(x, y));
      break;
    }
    // console.log(y, ranges);
  }
}
//run(parseInput(input), 2000000);
//runB(parseInput(test_input), 0, 20);
runB(parseInput(input), 0, 4000000);
