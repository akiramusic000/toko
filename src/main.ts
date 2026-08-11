import "./style.css";
import type { Game } from "./game";
import { GameState } from "./game";

let game: Game = {
  columnValues: [2, 2, 2, 2, 2],
  rowValues: [2, 3, 2, 2, 1],
  rows: [
    [2, null, 3, null, 2],
    [null, 4, null, 4, null],
    [null, 4, null, 4, null],
    [2, null, 3, null, 2],
    [1, 2, null, 2, 1],
  ],
};

let state = new GameState(game);

function render() {
  let win = "";
  if (state.completed()) {
    win = '<p class="win">You win!</p>';
  }

  document.querySelector<HTMLDivElement>("#app")!.innerHTML =
    `<button onclick="reset()">Reset</button>${state.render()}${win}`;
}

render();

declare global {
  var clickBox: (row: number, column: number) => void;
  var markBox: (row: number, column: number) => void;
  var reset: () => void;
}

globalThis.clickBox = function (row: number, column: number) {
  if (state.rows[row][column] == null) {
    state.rows[row][column] = "box";
  } else if (state.rows[row][column] == "box") {
    state.rows[row][column] = null;
  }
  render();
};

globalThis.markBox = function (row: number, column: number) {
  if (state.rows[row][column] == null || state.rows[row][column] == "box") {
    state.rows[row][column] = "X";
  } else if (state.rows[row][column] == "X") {
    state.rows[row][column] = null;
  }
  render();
};

globalThis.reset = function () {
  state.reset();
  render();
  console.log("reset");
};
