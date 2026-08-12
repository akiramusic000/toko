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

const urlParams = new URLSearchParams(window.location.search);
const codeValue = urlParams.get("code");
const stateValue = urlParams.get("state");

let game: Game;
let state: GameState;
let code: string;

if (codeValue != null) {
  code = codeValue;
  game = importGame(code);
  state = new GameState(game);
} else if (stateValue != null) {
  state = GameState.import(stateValue);
  game = state.game;
  code = exportGame(game);
} else {
  game = randomGame(rows, columns, boxes, hints)!;
  state = new GameState(game);
  code = exportGame(game);
}

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
      <button onclick="sharePuzzle()">Share Puzzle</button>
      <span id="sharePuzzle"></span>
    <br/>
      <button onclick="shareState()">Share Solution</button>
      <span id="shareState"></span>
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
  var sharePuzzle: () => void;
  var shareState: () => void;
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

globalThis.sharePuzzle = function () {
  let share = document.querySelector<HTMLParagraphElement>("#sharePuzzle")!;
  let params = `?code=${code}`;
  let url = `${window.location.origin + window.location.pathname}${params}`;
  share.innerText = "URL copied to clipboard";
  navigator.clipboard.writeText(url);
  window.history.replaceState({}, "", url.toString());
};

globalThis.shareState = function () {
  let share = document.querySelector<HTMLParagraphElement>("#shareState")!;
  let params = `?state=${state.export()}`;
  let url = `${window.location.origin + window.location.pathname}${params}`;
  share.innerText = "URL copied to clipboard";
  navigator.clipboard.writeText(url);
  window.history.replaceState({}, "", url.toString());
};
