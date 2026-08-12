export class Game {
  columnValues: number[] = [];
  rowValues: number[] = [];
  rows: (number | null)[][] = [];

  constructor(
    columnValues: number[],
    rowValues: number[],
    rows: (number | null)[][],
  ) {
    this.columnValues = columnValues;
    this.rowValues = rowValues;
    this.rows = rows;
  }

  static random(
    rowCount: number,
    columnCount: number,
    boxes: number,
    hints: number,
  ): Game | null {
    let game = GameState.randomSolved(
      rowCount,
      columnCount,
      boxes,
      hints,
    )?.game;
    if (game == undefined) {
      return null;
    } else {
      return game;
    }
  }

  static empty(rowCount: number, columnCount: number): Game {
    let rowValues = Array(rowCount).fill(0);
    let columnValues = Array(columnCount).fill(0);
    let rows = Array(rowCount)
      .fill(null)
      .map(() => Array(columnCount).fill(null));

    return new Game(columnValues, rowValues, rows);
  }

  export(): string {
    let rowCount = this.rowValues.length;
    let columnCount = this.columnValues.length;

    let values = "";
    for (const value of this.columnValues) {
      values += `,${value}`;
    }
    for (const value of this.rowValues) {
      values += `,${value}`;
    }

    let rows = "";

    for (const row of this.rows) {
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

  static import(gameString: string): Game {
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

    return new Game(columnValues, rowValues, rows);
  }

  clone(): Game {
    const copy = Game.empty(0, 0);
    Object.assign(copy, structuredClone(this));
    return copy;
  }

  solve(): GameState[] | null {
    let state = new GameState(this);

    return state.solveWithBacktrack(0, 50, new Set());
  }

  solveNoBacktrack(): GameState | null {
    let state = new GameState(this);

    state.solveNoBacktrack();

    return state;
  }
}

function random<T>(array: T[]): T {
  let idx = Math.floor(Math.random() * array.length);
  let value = array[idx];

  let last = array[array.length - 1];
  array[idx] = last;
  array.pop();

  return value;
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

function countNeighborsBox(
  rows: ("box" | "X" | number | null)[][],
  row: number,
  column: number,
): number {
  function getCellCount(row: number, column: number): number {
    if (rows.length <= row || row < 0) {
      return 0;
    } else if (rows[row].length <= column || column < 0) {
      return 0;
    } else if (rows[row][column] == "box") {
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

function countNeighborsEmpty(
  rows: ("box" | "X" | number | null)[][],
  row: number,
  column: number,
): number {
  function getCellCount(row: number, column: number): number {
    if (rows.length <= row || row < 0) {
      return 0;
    } else if (rows[row].length <= column || column < 0) {
      return 0;
    } else if (rows[row][column] == null) {
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

function countNeighborsX(
  rows: ("box" | "X" | number | null)[][],
  row: number,
  column: number,
): number {
  function getCellCount(row: number, column: number): number {
    if (rows.length <= row || row < 0) {
      return 0;
    } else if (rows[row].length <= column || column < 0) {
      return 0;
    } else if (
      rows[row][column] == "X" ||
      typeof rows[row][column] == "number"
    ) {
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

function findRowValues<T>(rows: T[][], value: T): number[] {
  let out = [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    let count = 0;

    for (let columnIdx = 0; columnIdx < rows[rowIdx].length; columnIdx++) {
      if (rows[rowIdx][columnIdx] == value) {
        count += 1;
      }
    }

    out.push(count);
  }

  return out;
}

function countRowBox(
  rows: (number | "box" | "X" | null)[][],
  row: number,
): number {
  let count = 0;

  for (let columnIdx = 0; columnIdx < rows[row].length; columnIdx++) {
    if (rows[row][columnIdx] == "box") {
      count += 1;
    }
  }

  return count;
}

function countRowX(
  rows: (number | "box" | "X" | null)[][],
  row: number,
): number {
  let count = 0;

  for (let columnIdx = 0; columnIdx < rows[row].length; columnIdx++) {
    if (
      rows[row][columnIdx] == "X" ||
      typeof rows[row][columnIdx] == "number"
    ) {
      count += 1;
    }
  }

  return count;
}

function findColumnValues<T>(rows: T[][], value: T): number[] {
  let out = [];

  for (let columnIdx = 0; columnIdx < rows[0].length; columnIdx++) {
    let count = 0;

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      if (rows[rowIdx][columnIdx] == value) {
        count += 1;
      }
    }

    out.push(count);
  }

  return out;
}

function countColumnBox(
  rows: ("box" | "X" | number | null)[][],
  column: number,
): number {
  let count = 0;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    if (rows[rowIdx][column] == "box") {
      count += 1;
    }
  }

  return count;
}

function countColumnX(
  rows: ("box" | "X" | number | null)[][],
  column: number,
): number {
  let count = 0;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    if (
      rows[rowIdx][column] == "X" ||
      typeof rows[rowIdx][column] == "number"
    ) {
      count += 1;
    }
  }

  return count;
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

  removeX() {
    for (const [rowIdx, row] of this.rows.entries()) {
      for (const [columnIdx, val] of row.entries()) {
        if (val == "X") {
          this.rows[rowIdx][columnIdx] = null;
        }
      }
    }
  }

  resetPuzzleEditor() {
    this.game = Game.empty(this.rowValues.length, this.columnValues.length);
    this.reset();
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

  static randomSolved(
    rowCount: number,
    columnCount: number,
    boxes: number,
    hints: number,
  ): GameState | null {
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

    let gameRows = [];

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      let gameRow = [];

      for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
        if (rows[rowIdx][columnIdx] == "box") {
          gameRow.push(null);
        } else {
          gameRow.push(rows[rowIdx][columnIdx]);
        }
      }

      gameRows.push(gameRow);
    }

    let state = new GameState(new Game(columnValues, rowValues, gameRows));
    state.rows = rows;
    return state;
  }

  renderPuzzleEditor(): string {
    this.rowValues = findRowValues(this.rows, "box");
    this.columnValues = findColumnValues(this.rows, "box");
    this.game.rowValues = this.rowValues;
    this.game.columnValues = this.columnValues;

    let out = '<table><thead><tr><th class = "empty"></th>';

    for (const i of this.columnValues) {
      out += `<th scope="col">${i}</th>`;
    }

    out += "</tr></thead><tbody>";

    for (const [rowIdx, row] of this.rows.entries()) {
      out += `<tr><th scope="row">${this.rowValues[rowIdx]}</th>`;
      for (var [columnIdx, value] of row.entries()) {
        const click = `onclick="clickBox(${rowIdx}, ${columnIdx})", oncontextmenu="markBox(${rowIdx}, ${columnIdx}); return false;"`;

        if (typeof value == "number") {
          value = countNeighbors(this.rows, (value = "box"), rowIdx, columnIdx);
          this.rows[rowIdx][columnIdx] = value;
          this.game.rows[rowIdx][columnIdx] = value;
          out += `<td ${click}>${value}</td>`;
        } else if (value == "box") {
          out += `<td class="box", ${click}></td>`;
        } else if (value == "X") {
          out += `<td class="x", ${click}>X</td>`;
        } else if (value == null) {
          this.game.rows[rowIdx][columnIdx] = null;
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

    let count = countNeighbors(this.rows, "box", row, column);

    return count == neighborCount;
  }

  export(): string {
    let rowCount = this.rowValues.length;
    let columnCount = this.columnValues.length;

    let values = "";
    for (const value of this.columnValues) {
      values += `,${value}`;
    }
    for (const value of this.rowValues) {
      values += `,${value}`;
    }

    let rows = "";

    for (const row of this.rows) {
      for (const value of row) {
        if (value == null) {
          rows += "-";
        } else if (value == "X") {
          rows += "x";
        } else if (value == "box") {
          rows += "+";
        } else {
          rows += value;
        }
      }
    }

    return `${rowCount},${columnCount}${values},${rows}`;
  }

  static import(string: string): GameState {
    let array = string.split(",");
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
    let gameRows = [];

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      let row = [];
      let gameRow = [];

      for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
        let c = rowsString[rowIdx * columnCount + columnIdx];
        if (c == "-") {
          row.push(null);
          gameRow.push(null);
        } else if (c == "x") {
          row.push("X");
          gameRow.push(null);
        } else if (c == " ") {
          // Would be a plus, but pluses in URLs become spaces when parsed

          row.push("box");
          gameRow.push(null);
        } else {
          console.log("number?", c.codePointAt(0));
          row.push(Number.parseInt(c));
          gameRow.push(Number.parseInt(c));
        }
      }

      rows.push(row);
      gameRows.push(gameRow);
    }

    let gameState = new GameState(new Game(columnValues, rowValues, gameRows));
    gameState.rows = rows as (number | null | "X" | "box")[][];

    return gameState;
  }

  exportPuzzleEditor(): string {
    let rowCount = this.rowValues.length;
    let columnCount = this.columnValues.length;

    let code = "";

    for (const row of this.rows) {
      for (const value of row) {
        if (value == "box") {
          code += "+";
        } else if (value == null) {
          code += "-";
        } else {
          code += "x";
        }
      }
    }

    return `${rowCount},${columnCount},${code}`;
  }

  static importPuzzleEditor(code: string): GameState {
    let array = code.split(",");
    let rowCount = Number.parseInt(array[0]);
    let columnCount = Number.parseInt(array[1]);
    let rowsCode = array[2];

    let rows = [];

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      let row = [];

      for (let columnIdx = 0; columnIdx < columnCount; columnIdx++) {
        let c = rowsCode[rowIdx * columnCount + columnIdx];
        if (c == " ") {
          row.push("box");
        } else if (c == "-") {
          row.push(null);
        } else if (c == "x") {
          row.push(0);
        }
      }

      rows.push(row);
    }

    let gameRows = [];

    for (let [rowIdx, row] of rows.entries()) {
      let gameRow = [];

      for (let [columnIdx, value] of row.entries()) {
        if (value == 0) {
          rows[rowIdx][columnIdx] = countNeighbors(
            rows,
            "box",
            rowIdx,
            columnIdx,
          );
        }

        if (value != "box") {
          gameRow.push(value);
        } else {
          gameRow.push(null);
        }
      }

      gameRows.push(gameRow);
    }

    let rowValues = findRowValues(rows, "box");
    let columnValues = findColumnValues(rows, "box");

    let state = new GameState(
      new Game(columnValues, rowValues, gameRows as (number | null)[][]),
    );
    state.rows = rows as ("box" | "X" | number | null)[][];

    return state;
  }

  clone(): GameState {
    const copy = new GameState(Game.empty(0, 0));
    Object.assign(copy, structuredClone(this));
    copy.game = this.game.clone();
    return copy;
  }

  solveNoBacktrack() {
    let state = this;

    function fillRow(row: number, value: "X" | "box" | null) {
      for (let columnIdx = 0; columnIdx < state.rows[row].length; columnIdx++) {
        if (state.rows[row][columnIdx] == null) {
          state.rows[row][columnIdx] = value;
        }
      }
    }
    function fillColumn(column: number, value: "X" | "box" | null) {
      for (let rowIdx = 0; rowIdx < state.rows.length; rowIdx++) {
        if (state.rows[rowIdx][column] == null) {
          state.rows[rowIdx][column] = value;
        }
      }
    }

    function fillNeighbors(
      row: number,
      column: number,
      value: "X" | "box" | null,
    ) {
      function set(row: number, column: number, value: "X" | "box" | null) {
        if (
          row >= state.rows.length ||
          row < 0 ||
          column >= state.rows[row].length ||
          column < 0
        ) {
          return;
        }

        if (state.rows[row][column] == null) {
          state.rows[row][column] = value;
        }
      }

      set(row - 1, column - 1, value);
      set(row - 1, column + 0, value);
      set(row - 1, column + 1, value);
      set(row + 0, column - 1, value);
      set(row + 0, column + 1, value);
      set(row + 1, column - 1, value);
      set(row + 1, column + 0, value);
      set(row + 1, column + 1, value);
    }

    let last = JSON.stringify(state);

    while (true) {
      for (let [rowIdx, rowValue] of state.rowValues.entries()) {
        if (rowValue == countRowBox(state.rows, rowIdx)) {
          fillRow(rowIdx, "X");
        } else if (
          rowValue ==
          state.columnValues.length - countRowX(state.rows, rowIdx)
        ) {
          fillRow(rowIdx, "box");
        }
      }

      for (let [columnIdx, columnValue] of state.columnValues.entries()) {
        if (columnValue == countColumnBox(state.rows, columnIdx)) {
          fillColumn(columnIdx, "X");
        } else if (
          columnValue ==
          state.rowValues.length - countColumnX(state.rows, columnIdx)
        ) {
          fillColumn(columnIdx, "box");
        }
      }

      for (let [rowIdx, _rowValue] of state.rowValues.entries()) {
        for (let [columnIdx, _columnValue] of state.columnValues.entries()) {
          let value = state.rows[rowIdx][columnIdx];
          if (typeof value == "number") {
            if (countNeighborsBox(state.rows, rowIdx, columnIdx) == value) {
              fillNeighbors(rowIdx, columnIdx, "X");
            } else if (
              value ==
              countNeighborsEmpty(state.rows, rowIdx, columnIdx) +
                countNeighborsBox(state.rows, rowIdx, columnIdx)
            ) {
              fillNeighbors(rowIdx, columnIdx, "box");
            }
          }
        }
      }

      if (last == JSON.stringify(state)) {
        break;
      } else {
        last = JSON.stringify(state);
      }
    }
  }

  solveWithBacktrack(
    count: number,
    limit: number,
    set: Set<string>,
  ): GameState[] {
    if (count > limit) {
      return [];
    }

    let state: GameState = this.clone();

    state.solveNoBacktrack();

    if (state.completed()) {
      return [state];
    }

    let solved: GameState[] = [];

    for (const [rowIdx, row] of state.rows.entries()) {
      for (const [columnIdx, value] of row.entries()) {
        if (value == null) {
          state.rows[rowIdx][columnIdx] = "box";
          if (set.has(JSON.stringify(state))) {
            continue;
          }
          set.add(JSON.stringify(state));
          solved = solved.concat(
            state.solveWithBacktrack(count + solved.length, limit, set),
          );
          state.rows[rowIdx][columnIdx] = null;
        }
      }
    }

    return solved;
  }
}
