export type Game = {
  columnValues: number[];
  rowValues: number[];
  rows: (number | null)[][];
};

export class GameState {
  columnValues: number[];
  rowValues: number[];
  rows: (number | null | "X" | "box")[][];

  constructor(game: Game) {
    this.columnValues = game.columnValues;
    this.rowValues = game.rowValues;
    this.rows = game.rows;
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
