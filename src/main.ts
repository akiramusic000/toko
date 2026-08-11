import "./style.css";
import type { Game } from "./game";
import { exportGame, GameState, importGame, randomGame } from "./game";

/*let game: Game = {
  columnValues: [5, 1, 5, 0, 4, 0],
  rowValues: [3, 2, 4, 3, 3, 0],
  rows: [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, 5, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, 2, null, null, null, null],
  ],
};*/

let rows = 5;
let columns = 5;
let boxes = 10;
let hints = 5;

let game: Game = randomGame(5, 5, 10, 5)!;

let state = new GameState(game);

let code = exportGame(game);

function render() {
  let win = "";
  if (state.completed()) {
    win = '<p class="win">You win!</p>';
  }

  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
      <label for="rows">Rows</label>
      <input type="number" name="rows" size=1px id="rows", value="${rows}", onchange="updateState()"></input>
      <label for="columns">Columns</label>
      <input type="number" name="columns" size=1px id="columns", value="${columns}", onchange="updateState()"></input>
      <label for="boxes">Boxes</label>
      <input type="number" name="boxes" size=1px id="boxes", value="${boxes}", onchange="updateState()"></input>
      <label for="hints">Hints</label>
      <input type="number" name="hints" size=1px id="hints", value="${hints}", onchange="updateState()"></input>
      <button onclick="generateRandom()">Generate New Random</button>
    </br>
      <label for="code">Puzzle Code</label>
      <input type="text" name="code" size=50px id="codeIn", value="${code}", onchange="updateState()"></input>
    <br/>
      <button onclick="reset()">Reset</button>
      ${state.render()}${win}
    `;

  let codeIn = document.querySelector<HTMLInputElement>("#codeIn")!;
  codeIn.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      // Prevent default behavior if inside a <form> (prevents auto-submit)
      ev.preventDefault();

      code = codeIn.value;
      game = importGame(code);
      state = new GameState(game);
      render();
    }
  });
}

render();

declare global {
  var clickBox: (row: number, column: number) => void;
  var markBox: (row: number, column: number) => void;
  var reset: () => void;
  var generateRandom: () => void;
  var updateState: () => void;
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

globalThis.generateRandom = function () {
  game = randomGame(rows, columns, boxes, hints)!;
  state = new GameState(game);
  render();

  code = exportGame(game);
  document.querySelector<HTMLInputElement>("#codeIn")!.value = code;
};

globalThis.updateState = function () {
  rows = Number.parseInt(
    document.querySelector<HTMLInputElement>("#rows")!.value,
  );
  columns = Number.parseInt(
    document.querySelector<HTMLInputElement>("#columns")!.value,
  );
  boxes = Number.parseInt(
    document.querySelector<HTMLInputElement>("#boxes")!.value,
  );
  hints = Number.parseInt(
    document.querySelector<HTMLInputElement>("#hints")!.value,
  );
  code = document.querySelector<HTMLInputElement>("#codeIn")!.value;
};
