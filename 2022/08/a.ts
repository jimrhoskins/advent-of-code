export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim().split("\n");

const test_input = `
30373
25512
65332
33549
35390
`
  .trim()
  .split("\n");

/* 
const leftToRightVisiblity = (row: number[]) => {
  let height = -1;
  const leftVisibAle = row.map((cell) => {
    if (cell > height) {
      height = cell;
      return true;
    }
    return false;
  });
  return leftVisibAle;
};
const rightToLeftVisiblity = (row: number[]) => {
  return leftToRightVisiblity(row.reverse()).reverse();
};

const rowVisibility = (row: number[]) => {
  const rightToLeft = rightToLeftVisiblity(row);
  return leftToRightVisiblity(row).map((left, i) => left || rightToLeft[i]);
};

const columnVisibilities = (grid: number[][]) => {
  const sidewaysVisibility = grid[0].map((_, i) =>
    rowVisibility(grid.map((row) => row[i]))
  );
  const visibilities = sidewaysVisibility[0].map((_, i) =>
    sidewaysVisibility.map((row) => row[sidewaysVisibility.length - i])
  );
  return visibilities;
};
*/

const bruteForce = (grid: number[][]) => {
  // Create initial grid of all false values
  const results = grid.map((row) => row.map(() => false));
  console.log({ results });
  // For each row, calculate the visibility of each cell
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      results[i][j] = cellVisibile(grid, i, j);
    }
  }

  return results;
};

const cellVisibile = (grid: number[][], i: number, j: number): boolean => {
  const cell = grid[i][j];
  const row = grid[i];
  const column = grid.map((row) => row[j]);
  const rowLeft = row.slice(0, j);
  const rowRight = row.slice(j + 1);
  const columnAbove = column.slice(0, i);
  const columnBelow = column.slice(i + 1);
  const rowLeftVisible = rowLeft.every((cell) => cell < row[j]);
  const rowRightVisible = rowRight.every((cell) => cell < row[j]);
  const columnAboveVisible = columnAbove.every((cell) => cell < row[j]);
  const columnBelowVisible = columnBelow.every((cell) => cell < row[j]);
  // console.log({
  //   rowLeftVisible,
  //   rowRightVisible,
  //   columnAboveVisible,
  //   columnBelowVisible,
  // });

  return (
    rowLeftVisible ||
    rowRightVisible ||
    columnAboveVisible ||
    columnBelowVisible
  );
};

const scenicValue = (grid: number[][], i: number, j: number): number => {
  let visibileLeft = 0;
  let visibileRight = 0;
  let visibileAbove = 0;
  let visibileBelow = 0;
  const consideredHeight = grid[i][j];
  for (let x = i - 1; x >= 0; x--) {
    //console.log({ x, j, cell: grid[x][j], cell2: grid[i][j] });
    visibileAbove++;
    if (grid[x][j] >= consideredHeight) {
      break;
    }
  }
  for (let x = i + 1; x < grid.length; x++) {
    visibileBelow++;
    if (grid[x][j] >= consideredHeight) {
      break;
    }
  }

  for (let y = j - 1; y >= 0; y--) {
    visibileLeft++;
    if (grid[i][y] >= consideredHeight) {
      break;
    }
  }

  for (let y = j + 1; y < grid[i].length; y++) {
    console.log({ i, y, cell: grid[i][y], cell2: grid[i][j] });
    visibileRight++;
    if (grid[i][y] >= consideredHeight) {
      break;
    }
  }

  console.log({ visibileLeft, visibileRight, visibileAbove, visibileBelow });

  return visibileLeft * visibileRight * visibileAbove * visibileBelow;
};

const totalVisible = (grid: boolean[][]) => {
  return grid.reduce((total, row) => {
    return (
      total +
      row.reduce((rowTotal, cell) => {
        return cell ? rowTotal + 1 : rowTotal;
      }, 0)
    );
  }, 0);
};

const runA = (input: string[]) => {
  const grid = input.map((line) => line.split("").map((c) => parseInt(c, 10)));
  const visibilites = bruteForce(grid);
  console.log({ visibilites });
  console.log(totalVisible(visibilites));
  return;
};

const runB = (input: string[]) => {
  const grid = input.map((line) => line.split("").map((c) => parseInt(c, 10)));
  const visibilites = bruteForce(grid);
  console.log(scenicValue(grid, 3, 2));

  const maxScenic = grid.reduce((max, row, i) => {
    return row.reduce((rowMax, cell, j) => {
      const scenic = scenicValue(grid, i, j);
      return scenic > rowMax ? scenic : rowMax;
    }, max);
  }, 0);
  console.log({ maxScenic });
};

runB(input);
