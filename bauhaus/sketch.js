// ─── Audio ────────────────────────────────────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

const NOTES = [261.63, 293.66, 329.63, 392.00, 440.00,
               523.25, 587.33, 659.25, 783.99, 880.00,
               1046.50, 1174.66];

function playNote(hz) {
  let ctx  = getAudioCtx();
  let osc  = ctx.createOscillator();
  let gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(hz, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.65);
}

// ─── Cells ────────────────────────────────────────────────────────────────────
let cells = [];
const SQ     = 100;
const OFFSET = 100;

function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function setup() {
  createCanvas(700, 1100);

  let colorRows = [
    ["navy",         "crimson",      [227, 196, 18]],
    [[227, 196, 18], "navy",         "crimson"     ],
    ["crimson",      [227, 196, 18], "navy"        ],
    ["navy",         "crimson",      [227, 196, 18]]
  ];

  let xs = [150, 350, 550];
  let ys = [200, 400, 600, 800];

  let idx = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push({
        x: xs[c],
        y: ys[r],
        col: colorRows[r][c],
        t: 0,
        pressed: false,
        noteHz: NOTES[idx % NOTES.length]
      });
      idx++;
    }
  }
}

function drawCell(cell) {
  let e      = ease(cell.t);
  let shift  = e * OFFSET;
  let shadow = OFFSET * (1 - e);
  let x = cell.x - shift;
  let y = cell.y + shift;

  noStroke();

  if (shadow > 0.5) {
    fill(0);
    beginShape();
    vertex(x,               y);
    vertex(x - shadow,      y + shadow);
    vertex(x - shadow,      y + SQ + shadow);
    vertex(x + SQ - shadow, y + SQ + shadow);
    vertex(x + SQ,          y + SQ);
    vertex(x,               y + SQ);
    endShape(CLOSE);
  }

  let c = cell.col;
  if (Array.isArray(c)) fill(c[0], c[1], c[2]);
  else fill(c);
  square(x, y, SQ);
}

function draw() {
  background(242, 237, 211);

  // ── Header ──────────────────────────────────────────────────────────────────
  // Top rule
  stroke(0);
  strokeWeight(4);
  line(40, 30, width - 40, 30);

  // Title line 1
  noStroke();
  textFont('Georgia');
  textStyle(BOLD);

  // "BAUHAUS " in black
  fill(0);
  textSize(26);
  textAlign(LEFT, TOP);
  text('BAUHAUS', 40, 44);

  // "AUSSTELLUNG " in crimson
  fill('crimson');
  text('AUSSTELLUNG', 40 + textWidth('BAUHAUS '), 44);

  // "WEIMAR" in black
  fill(0);
  text(' WEIMAR', 40 + textWidth('BAUHAUS AUSSTELLUNG'), 44);

  // Title line 2 — date in gold
  fill(227, 196, 18);
  textSize(20);
  text('JULY  —  AUGUST  —  SEPTEMBER  1923', 40, 76);

  // Artist name
  fill(80);
  textSize(11);
  textStyle(NORMAL);
  textFont('Courier New');
  text('inspired by H E R B E R T   B A Y E R', 40, 106);

  // Bottom rule
  stroke(0);
  strokeWeight(2);
  line(40, 126, width - 40, 126);

  // ── Cells ───────────────────────────────────────────────────────────────────
  let anyAnimating = false;
  for (let cell of cells) {
    let target = cell.pressed ? 1 : 0;
    if (abs(cell.t - target) > 0.001) {
      cell.t += (target - cell.t) * 0.25;
      anyAnimating = true;
    } else {
      cell.t = target;
    }
    drawCell(cell);
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  stroke(150);
  strokeWeight(1);
  line(40, height - 44, width - 40, height - 44);
  noStroke();
  fill('crimson');
  textSize(18);
  textAlign(LEFT, CENTER);
  text('\u2669', 40, height - 24);
  fill(60);
  textSize(10);
  textFont('Courier New');
  text('Click a square to animate — each press plays a musical tone.', 66, height - 24);

  if (!anyAnimating) noLoop();
}

function mousePressed() {
  for (let cell of cells) {
    if (mouseX >= cell.x - OFFSET && mouseX <= cell.x + SQ + OFFSET &&
        mouseY >= cell.y          && mouseY <= cell.y + SQ + OFFSET) {
      if (!cell.pressed) {
        cell.pressed = true;
        playNote(cell.noteHz);
      }
      loop();
    }
  }
}

function mouseReleased() {
  for (let cell of cells) cell.pressed = false;
  loop();
}