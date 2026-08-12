import "./style.css";
import { Game, GameState } from "./game";

let rows = 5;
let columns = 5;
let boxes = 10;
let hints = 5;

const urlParams = new URLSearchParams(window.location.search);
const codeValue = urlParams.get("code");
const stateValue = urlParams.get("state");
const puzzleValue = urlParams.get("puzzle");

let state: GameState;
let code: string;
let puzzleEditor = false;

if (puzzleValue != null) {
  state = GameState.importPuzzleEditor(puzzleValue);
  puzzleEditor = true;
} else if (stateValue != null) {
  state = GameState.import(stateValue);
  code = state.game.export();
} else if (codeValue != null) {
  code = codeValue;
  state = new GameState(Game.import(code));
} else {
  state = new GameState(Game.random(rows, columns, boxes, hints)!);
  code = state.game.export();
}

function renderPuzzle() {
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
      <button onclick="puzzleEditor()">Puzzle Editor (Will break current puzzle if not solved!)</button>
    <br/>
      <button onclick="solve()">Solve (With Backtracking)</button>
    <br/>
      <button onclick="solveNoBacktrack()">Solve (Without Backtracking)</button>
    <br/>
      <button onclick="reset()">Reset</button>
    <br/>
      ${state.render()}${win}
    `;

  let codeIn = document.querySelector<HTMLInputElement>("#codeIn")!;
  codeIn.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      // Prevent default behavior if inside a <form> (prevents auto-submit)
      ev.preventDefault();

      code = codeIn.value;
      state = new GameState(Game.import(code));
      renderPuzzle();
    }
  });

  let params = `?state=${state.export()}?code=${code}`;
  let url = `${window.location.origin + window.location.pathname}${params}`;
  window.history.replaceState({}, "", url.toString());
}

if (puzzleEditor) {
  renderPuzzleEditor();
} else {
  renderPuzzle();
}

function renderPuzzleEditor() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <label for="rows">Rows</label>
      <input type="number" name="rows" size=1px id="rows", value="${rows}", onchange="updateState()"></input>
      <label for="columns">Columns</label>
      <input type="number" name="columns" size=1px id="columns", value="${columns}", onchange="updateState()"></input>
      <label for="boxes">Boxes</label>
      <input type="number" name="boxes" size=1px id="boxes", value="${boxes}", onchange="updateState()"></input>
      <label for="hints">Hints</label>
      <input type="number" name="hints" size=1px id="hints", value="${hints}", onchange="updateState()"></input>
      <button onclick="generateRandomSolved()">Generate New Random</button>
      <button onclick="generateEmpty()">Generate New Empty</button>
    </br>
      <button onclick="puzzleViewer()">Puzzle Viewer</button>
    <br/>
      <button onclick="reset()">Reset</button>
    ${state.renderPuzzleEditor()}
  `;

  let params = `?puzzle=${state.exportPuzzleEditor()}`;
  let url = `${window.location.origin + window.location.pathname}${params}`;
  window.history.replaceState({}, "", url.toString());
}

declare global {
  var clickBox: (row: number, column: number) => void;
  var markBox: (row: number, column: number) => void;
  var reset: () => void;
  var generateRandom: () => void;
  var generateRandomSolved: () => void;
  var generateEmpty: () => void;
  var updateState: () => void;
  var sharePuzzle: () => void;
  var shareState: () => void;
  var puzzleEditor: () => void;
  var puzzleViewer: () => void;
  var solve: () => void;
  var solveNoBacktrack: () => void;
}

globalThis.clickBox = function (row: number, column: number) {
  if (puzzleEditor) {
    if (state.rows[row][column] == null) {
      state.rows[row][column] = "box";
    } else {
      state.rows[row][column] = null;
    }

    renderPuzzleEditor();
  } else {
    if (state.rows[row][column] == null) {
      state.rows[row][column] = "box";
    } else if (state.rows[row][column] == "box") {
      state.rows[row][column] = null;
    }
    renderPuzzle();
  }
};

globalThis.markBox = function (row: number, column: number) {
  if (puzzleEditor) {
    if (state.rows[row][column] == null || state.rows[row][column] == "box") {
      state.rows[row][column] = 0;
    } else {
      state.rows[row][column] = null;
    }

    renderPuzzleEditor();
  } else {
    if (state.rows[row][column] == null || state.rows[row][column] == "box") {
      state.rows[row][column] = "X";
    } else if (state.rows[row][column] == "X") {
      state.rows[row][column] = null;
    }
    renderPuzzle();
  }
};

globalThis.reset = function () {
  if (puzzleEditor) {
    state.resetPuzzleEditor();
    renderPuzzleEditor();
  } else {
    state.reset();
    renderPuzzle();
  }
};

globalThis.generateRandom = function () {
  state = new GameState(Game.random(rows, columns, boxes, hints)!);
  renderPuzzle();

  code = state.game.export();
  document.querySelector<HTMLInputElement>("#codeIn")!.value = code;
};

globalThis.generateRandomSolved = function () {
  state = GameState.randomSolved(rows, columns, boxes, hints)!;
  renderPuzzleEditor();

  code = state.game.export();
  document.querySelector<HTMLInputElement>("#codeIn")!.value = code;
};

globalThis.generateEmpty = function () {
  state = new GameState(Game.empty(rows, columns)!);
  renderPuzzleEditor();

  code = state.game.export();
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
};

globalThis.puzzleEditor = function () {
  puzzleEditor = true;

  state.removeX();

  renderPuzzleEditor();
};

globalThis.puzzleViewer = function () {
  puzzleEditor = false;
  code = state.game.export();

  renderPuzzle();
};

globalThis.solve = function () {
  renderPuzzle();

  console.log(state);

  let states = state.game.solve();
  if (states == null) {
    alert("Failed to solve!");
  } else {
    state = states[0];
    renderPuzzle();

    for (const state of states) {
      document.querySelector<HTMLDivElement>("#app")!.innerHTML +=
        state.render();
    }
  }
};

globalThis.solveNoBacktrack = function () {
  renderPuzzle();

  state.solveNoBacktrack();

  renderPuzzle();
};
