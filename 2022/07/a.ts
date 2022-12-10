export const _ = "";
import * as fs from "fs";

const file = fs.readFileSync("./input.txt");
const input = file.toString().trim();

const test_input = `
$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`.trim();

class Dir {
  parent: Dir | null;
  name: string;
  size: number;
  files: File[];
  dirs: Dir[];

  constructor(name: string, parent: Dir | null = null) {
    this.name = name;
    this.size = 0;
    this.files = [];
    this.dirs = [];
    this.parent = parent;
  }

  calculateSize() {
    this.size = this.files.reduce((acc, file) => acc + file.size, 0);
    this.dirs.forEach((dir) => {
      dir.calculateSize();
      this.size += dir.size;
    });
  }
}

type File = {
  name: string;
  size: number;
};

type Command = {
  type: "cd" | "ls";
  path: string;
  files?: string[];
};

const parseCommand = (line: string): Command => {
  const lines = line.split("\n");
  const [type, path] = lines[0].split(" ");

  // if th
  if (type == "cd") {
    return { type, path };
  } else if (type == "ls") {
    return {
      type,
      path,
      files: lines.slice(1).filter((l) => l.length),
    };
  }
  console.error("Unknown command", { line, type, path });
};

const parseLine = (line: string) => {
  const command = parseCommand(line);
  if (command.type == "cd") {
    return { type: "cd", path: command.path };
  } else {
    return { type: "ls", files: command.files };
  }
};

const parseInput = (input: string[]) => {
  const commands = input.map(parseLine);
  const root = new Dir("/");
  let currentDir = root;

  for (const command of commands) {
    if (command.type == "cd") {
      if (command.path == "..") {
        currentDir = currentDir.parent;
        continue;
      }
      if (command.path == "/") {
        currentDir = root;
        continue;
      }

      const dir = currentDir.dirs.find((d) => d.name == command.path);
      if (dir) {
        currentDir = dir;
      } else {
        const newDir = new Dir(command.path);
        currentDir.dirs.push(newDir);
        currentDir = newDir;
      }
    } else {
      for (const file of command.files) {
        const [a, b] = file.split(" ");
        if (a == "dir") {
          const newDir = new Dir(b, currentDir);
          currentDir.dirs.push(newDir);
          continue;
        }
        const [size, name] = file.split(" ");
        currentDir.files.push({ name, size: parseInt(size) });
      }
    }
  }
  return root;
};

const TOTAL_SIZE = 70000000;
const REQUIRED_SPACE = 30000000;

function totalSizeUnderLimit(dir: Dir, limit: number): number {
  let size = 0;
  if (dir.size <= limit) {
    size += dir.size;
  }
  for (const subDir of dir.dirs) {
    size += totalSizeUnderLimit(subDir, limit);
  }
  return size;
}

function findBestDirectory(root: Dir, neededSpace: number): Dir {
  let bestDir = root;
  let bestSize = root.size;
  for (const dir of root.dirs.map((d) => findBestDirectory(d, neededSpace))) {
    if (dir.size >= neededSpace && dir.size < bestSize) {
      bestDir = dir;
      bestSize = dir.size;
    }
  }
  return bestDir;
}

const runA = (input: string) => {
  const lines = input.split("$ ").slice(1);

  const root = parseInput(lines);

  root.calculateSize();

  console.log("a", totalSizeUnderLimit(root, 100000));

  const freeSpace = TOTAL_SIZE - root.size;
  const neededSpace = REQUIRED_SPACE - freeSpace;

  const bestDir = findBestDirectory(root, neededSpace);
  console.log("b", bestDir.name, bestDir.size);
};

runA(input);
