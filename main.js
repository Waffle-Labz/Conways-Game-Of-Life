const CANVAS = document.getElementById('canvas').getContext('2d');
const PLAY = document.getElementById('play');
const PAUSE = document.getElementById('pause');
const SPEED_UP = document.getElementById('speed-up');
const SLOW = document.getElementById('slow');
const RESET = document.getElementById('reset');
const RANDOMISE = document.getElementById('randomise');
const SPEED_P = document.getElementById('speed');
const GEN_P = document.getElementById('gen');

const WIDTH = CANVAS.canvas.width;
const HEIGHT = CANVAS.canvas.height;

const CELL_SIZE = 10;
const MIN_TIME = 100;
const MAX_TIME = 2000;
const SPEED_STEP = 100;

let timePerGen = 1000;
let playing = false;
let paused = false;
let generation = 0;

let CELLS = [];
let NEXT_CELLS = [];

// Initialise the grid.
function InitialiseGrid() {
    CELLS = [];
    NEXT_CELLS = [];

    for (let x = 0; x < WIDTH; x += CELL_SIZE) {
        CELLS[x] = [];
        NEXT_CELLS[x] = [];

        for (let y = 0; y < HEIGHT; y += CELL_SIZE) {
            CELLS[x][y] = 0;
            NEXT_CELLS[x][y] = 0;
        }
    }
}

// Round a coordinate down to the start of its cell.
function RoundMultiple(number, multiple) {
    return Math.floor(number / multiple) * multiple;
}

// Draw a single cell.
function FillCell(x, y, color) {
    CANVAS.fillStyle = color;
    CANVAS.fillRect(x, y, CELL_SIZE, CELL_SIZE);
}

// Draw the entire grid.
function Display() {
    for (let x = 0; x < WIDTH; x += CELL_SIZE) {
        for (let y = 0; y < HEIGHT; y += CELL_SIZE) {
            const color = CELLS[x][y] === 1 ? '#000000' : '#FFFFFF';
            FillCell(x, y, color);
        }
    }
}

// Update the generation counter.
function UpdateGenerationDisplay() {
    GEN_P.textContent = `GENERATION: ${generation}`;
}

// Count the live neighbours of a cell.
function CountLiveNeighbors(x, y) {
    let count = 0;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) {
                continue;
            }

            const neighborX = x + dx * CELL_SIZE;
            const neighborY = y + dy * CELL_SIZE;

            // Cells beyond the grid boundaries are treated as dead.
            if (
                neighborX >= 0 &&
                neighborX < WIDTH &&
                neighborY >= 0 &&
                neighborY < HEIGHT
            ) {
                count += CELLS[neighborX][neighborY];
            }
        }
    }

    return count;
}

// Calculate and display the next generation.
function Update() {
    if (!playing || paused) {
        return;
    }

    // Calculate the next state without modifying the current grid.
    for (let x = 0; x < WIDTH; x += CELL_SIZE) {
        for (let y = 0; y < HEIGHT; y += CELL_SIZE) {
            const liveNeighbors = CountLiveNeighbors(x, y);

            if (liveNeighbors < 2 || liveNeighbors > 3) {
                NEXT_CELLS[x][y] = 0;
            } else if (liveNeighbors === 3) {
                NEXT_CELLS[x][y] = 1;
            } else {
                NEXT_CELLS[x][y] = CELLS[x][y];
            }
        }
    }

    // Copy the calculated state into the current grid.
    for (let x = 0; x < WIDTH; x += CELL_SIZE) {
        for (let y = 0; y < HEIGHT; y += CELL_SIZE) {
            CELLS[x][y] = NEXT_CELLS[x][y];
        }
    }

    generation++;
    Display();
    UpdateGenerationDisplay();

    // Schedule exactly one subsequent generation.
    setTimeout(Update, timePerGen);
}

// Start the simulation if it is not already running.
function Play() {
    if (playing) {
        return;
    }

    playing = true;
    paused = false;
    PAUSE.textContent = 'PAUSE';

    Update();
}

// Pause or resume the simulation.
function TogglePause() {
    if (!playing) {
        return;
    }

    paused = !paused;
    PAUSE.textContent = paused ? 'RESUME' : 'PAUSE';

    if (!paused) {
        // Restart the update loop after resuming.
        Update();
    }
}

// Stop the simulation and reset the grid.
function Reset() {
    playing = false;
    paused = false;
    generation = 0;

    PAUSE.textContent = 'PAUSE';

    InitialiseGrid();
    Display();
    UpdateGenerationDisplay();
}

// Randomly populate the grid.
function Randomise() {
    playing = false;
    paused = false;
    generation = 0;

    PAUSE.textContent = 'PAUSE';

    InitialiseGrid();

    for (let x = 0; x < WIDTH; x += CELL_SIZE) {
        for (let y = 0; y < HEIGHT; y += CELL_SIZE) {
            CELLS[x][y] = Math.random() < 0.3 ? 1 : 0;
        }
    }

    Display();
    UpdateGenerationDisplay();
}

// Adjust simulation speed, keeping it within the allowed limits.
function ChangeSpeed(change) {
    timePerGen = Math.max(
        MIN_TIME,
        Math.min(MAX_TIME, timePerGen + change)
    );
}

// Toggle a cell by clicking the canvas.
CANVAS.canvas.addEventListener('click', function(event) {
    if (playing) {
        return;
    }

    const rect = CANVAS.canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) * (WIDTH / rect.width);
    const y = (event.clientY - rect.top) * (HEIGHT / rect.height);

    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
        return;
    }

    const cellX = RoundMultiple(x, CELL_SIZE);
    const cellY = RoundMultiple(y, CELL_SIZE);

    CELLS[cellX][cellY] = 1 - CELLS[cellX][cellY];

    Display();
});

// Connect the controls.
PLAY.addEventListener('click', Play);
PAUSE.addEventListener('click', TogglePause);

function UpdateSpeedDisplay() {
    const speed = 1000 / timePerGen;
    SPEED_P.textContent = `SPEED: ${speed.toFixed(2)}x`;
}

SPEED_UP.addEventListener('click', function() {
    ChangeSpeed(-SPEED_STEP);
    UpdateSpeedDisplay();
});

SLOW.addEventListener('click', function() {
    ChangeSpeed(SPEED_STEP);
    UpdateSpeedDisplay();
});

if (RESET) {
    RESET.addEventListener('click', Reset);
}

if (RANDOMISE) {
    RANDOMISE.addEventListener('click', Randomise);
}

// Initialise and display an empty grid.
InitialiseGrid();
Display();
UpdateGenerationDisplay();
