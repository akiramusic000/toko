export type Game = {
  columnValues: number[];
  rowValues: number[];
  rows: (number | null)[][];
};

function random<T>(array: T[]): T {
  let idx = Math.floor(Math.random() * array.length);
  let value = array[idx];

  let last = array[array.length - 1];
  array[idx] = last;
  array.pop();

  return value;
}

export function randomGame(
  rowCount: number,
  columnCount: number,
  boxes: number,
  hints: number,
): Game | null {
  if (boxes + hints > rowCount * columnCount) {
    return null;
  }

  let rowValues = Array(rowCount).fill(0);
  let columnValues = Array(columnCount).fill(0);
  let rows = Array(rowCount)
    .fill(null)
    .map(() => Array(columnCount).fill(null));

  let empties: [number, number][] = [];

  for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
      empties.push([rowIdx, columnIdx]);
    }
  }

  console.log(empties);

  for (let boxIdx = 0; boxIdx < boxes; boxIdx++) {
    let [row, column] = random(empties);

    rows[row][column] = "box";
  }

  for (let hintIdx = 0; hintIdx < hints; hintIdx++) {
    let [row, column] = random(empties);

    rows[row][column] = countNeighbors(rows, "box", row, column);
  }

  for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    let count = 0;
    for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
      if (rows[rowIdx][columnIdx] == "box") {
        count += 1;
      }
    }

    rowValues[rowIdx] = count;
  }

  for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
    let count = 0;
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      if (rows[rowIdx][columnIdx] == "box") {
        count += 1;
      }
    }

    columnValues[columnIdx] = count;
  }

  for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
      if (rows[rowIdx][columnIdx] == "box") {
        rows[rowIdx][columnIdx] = null;
      }
    }
  }

  return {
    columnValues: columnValues,
    rowValues: rowValues,
    rows: rows,
  };
}

function countNeighbors<T>(
  rows: T[][],
  value: T,
  row: number,
  column: number,
): number {
  function getCellCount(row: number, column: number): number {
    if (rows.length <= row || row < 0) {
      return 0;
    } else if (rows[row].length <= column || column < 0) {
      return 0;
    } else if (rows[row][column] == value) {
      return 1;
    } else {
      return 0;
    }
  }

  let count = 0;
  count += getCellCount(row - 1, column - 1);
  count += getCellCount(row + 0, column - 1);
  count += getCellCount(row + 1, column - 1);
  count += getCellCount(row - 1, column + 0);
  count += getCellCount(row + 1, column + 0);
  count += getCellCount(row - 1, column + 1);
  count += getCellCount(row + 0, column + 1);
  count += getCellCount(row + 1, column + 1);

  return count;
}

export function exportGame(game: Game): string {
  let rowCount = game.rowValues.length;
  let columnCount = game.columnValues.length;

  let values = "";
  for (const value of game.columnValues) {
    values += `,${value}`;
  }
  for (const value of game.rowValues) {
    values += `,${value}`;
  }

  let rows = "";

  for (const row of game.rows) {
    for (const value of row) {
      if (value == null) {
        rows += "-";
      } else {
        rows += value;
      }
    }
  }

  return `${rowCount},${columnCount}${values},${rows}`;
}

export function importGame(gameString: string): Game {
  let array = gameString.split(",");
  let rowCount = Number.parseInt(array[0]);
  let columnCount = Number.parseInt(array[1]);

  let rowValues = [];
  let columnValues = [];

  for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
    columnValues.push(Number.parseInt(array[columnIdx + 2]));
  }

  for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    rowValues.push(Number.parseInt(array[rowIdx + columnCount + 2]));
  }

  let rowsString = array[columnCount + rowCount + 2];
  console.log(rowsString);

  let rows = [];

  for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    let row = [];

    for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
      let c = rowsString[rowIdx * columnCount + columnIdx];
      if (c == "-") {
        row.push(null);
      } else {
        row.push(Number.parseInt(c));
      }
    }

    rows.push(row);
  }

  return {
    columnValues: columnValues,
    rowValues: rowValues,
    rows: rows,
  };
}

export class GameState {
  game: Game;
  columnValues: number[];
  rowValues: number[];
  rows: (number | null | "X" | "box")[][];

  constructor(game: Game) {
    this.game = game;
    this.columnValues = game.columnValues;
    this.rowValues = game.rowValues;
    this.rows = JSON.parse(JSON.stringify(game.rows));
  }

  reset() {
    this.rows = JSON.parse(JSON.stringify(this.game.rows));
  }

  render(): string {
    let out = '<table><thead><tr><th class = "empty"></th>';

    for (const i of this.columnValues) {
      out += `<th scope="col">${i}</th>`;
    }

    out += "</tr></thead><tbody>";

    for (const [rowIdx, row] of this.rows.entries()) {
      out += `<tr><th scope="row">${this.rowValues[rowIdx]}</th>`;
      for (const [columnIdx, value] of row.entries()) {
        const click = `onclick="clickBox(${rowIdx}, ${columnIdx})", oncontextmenu="markBox(${rowIdx}, ${columnIdx}); return false;"`;

        if (typeof value == "number") {
          out += `<td>${value}</td>`;
        } else if (value == "box") {
          out += `<td class="box", ${click}"></td>`;
        } else if (value == "X") {
          out += `<td class="x", ${click}>X</td>`;
        } else if (value == null) {
          out += `<td class="empty", ${click}></td>`;
        }
      }
      out += `</tr>`;
    }

    out += "</tbody></table>";

    return out;
  }

  completed(): boolean {
    for (const [rowIdx, _] of this.rowValues.entries()) {
      let count = 0;
      for (const [columnIdx, _] of this.columnValues.entries()) {
        if (this.rows[rowIdx][columnIdx] == "box") {
          count += 1;
        }
      }

      if (count != this.rowValues[rowIdx]) {
        console.log(`Row ${rowIdx}`);
        return false;
      }
    }

    for (const [columnIdx, _] of this.columnValues.entries()) {
      let count = 0;
      for (const [rowIdx, _] of this.rowValues.entries()) {
        if (this.rows[rowIdx][columnIdx] == "box") {
          count += 1;
        }
      }

      if (count != this.columnValues[columnIdx]) {
        console.log(`Column ${columnIdx}`);
        return false;
      }
    }

    for (const [rowIdx, _] of this.rowValues.entries()) {
      for (const [columnIdx, _] of this.columnValues.entries()) {
        if (!this.verifyCell(rowIdx, columnIdx)) {
          console.log(`Cell ${rowIdx}, ${columnIdx}`);
          return false;
        }
      }
    }

    return true;
  }

  verifyCell(row: number, column: number): boolean {
    let neighborCount = this.rows[row][column];
    if (
      neighborCount == "X" ||
      neighborCount == "box" ||
      neighborCount == null
    ) {
      return true;
    }

    let count = 0;
    count += this.getCellCount(row - 1, column - 1);
    count += this.getCellCount(row + 0, column - 1);
    count += this.getCellCount(row + 1, column - 1);
    count += this.getCellCount(row - 1, column + 0);
    count += this.getCellCount(row + 1, column + 0);
    count += this.getCellCount(row - 1, column + 1);
    count += this.getCellCount(row + 0, column + 1);
    count += this.getCellCount(row + 1, column + 1);

    console.log(`${count}`);

    return count == neighborCount;
  }

  getCellCount(row: number, column: number): number {
    if (this.validCell(row, column) && this.rows[row][column] == "box") {
      return 1;
    }

    return 0;
  }

  validCell(row: number, column: number): boolean {
    return (
      row < this.rowValues.length &&
      row >= 0 &&
      column < this.columnValues.length &&
      column >= 0
    );
  }
}
