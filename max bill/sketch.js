// ─── Audio ────────────────────────────────────────────────────────────────────
let audioCtx = null;
let chimeInterval = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

let pentatonic = [
  261.63, 293.66, 329.63, 392.00, 440.00,
  523.25, 587.33, 659.25, 784.00, 880.00
];

let chimeStep = 0;
let chimeDir  = 1;

function playChime(hz) {
  let ctx = getAudioCtx();
  let now = ctx.currentTime;

  // Main tone
  let osc  = ctx.createOscillator();
  let gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.start(now);
  osc.stop(now + 0.8);

  // Bell harmonic overtone
  let osc2  = ctx.createOscillator();
  let gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(hz * 2.756, now);
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.08, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc2.start(now);
  osc2.stop(now + 0.6);

  // Sub shimmer
  let osc3  = ctx.createOscillator();
  let gain3 = ctx.createGain();
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(hz * 0.5, now);
  gain3.gain.setValueAtTime(0, now);
  gain3.gain.linearRampToValueAtTime(0.06, now + 0.02);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  osc3.start(now);
  osc3.stop(now + 0.7);
}

function startChimes() {
  getAudioCtx();
  chimeInterval = setInterval(() => {
    playChime(pentatonic[chimeStep]);
    chimeStep += chimeDir;
    if (chimeStep >= pentatonic.length - 1) chimeDir = -1;
    if (chimeStep <= 0)                     chimeDir =  1;
  }, 400);
}

function stopChimes() {
  if (chimeInterval) {
    clearInterval(chimeInterval);
    chimeInterval = null;
  }
}

// ─── Circles ──────────────────────────────────────────────────────────────────
let circles = [];
let musicOn  = false;

function setup() {
  createCanvas(600, 850);
  angleMode(DEGREES);

  circles = [
    { ox:  0,   oy:  0,  sw: 30, col: [227,146,17],    size: 200, speed:  0.4, angle: 0   },
    { ox:  0,   oy:  0,  sw: 20, col: [86,128,64],     size: 300, speed: -0.3, angle: 60  },
    { ox:  0,   oy:  0,  sw: 15, col: [187,97,141],    size: 500, speed:  0.2, angle: 120 },
    { ox: -50,  oy:  25, sw: 30, col: [167,24,21],     size: 200, speed: -0.7, angle: 0   },
    { ox: -65,  oy:  25, sw: 25, col: [0,0,0],         size: 200, speed:  0.9, angle: 45  },
    { ox: -75,  oy:  50, sw: 15, col: [20,49,143,225], size: 325, speed: -0.5, angle: 90  },
    { ox: -65,  oy:  25, sw: 25, col: [0,0,0],         size: 400, speed:  0.6, angle: 180 },
    { ox: -45,  oy:  50, sw: 18, col: [206,82,19],     size: 375, speed: -0.8, angle: 270 },
  ];
}

function draw() {
  background(238, 223, 218);

  // ── HEADER ──────────────────────────────────────────────────────────────────
  stroke(0);
  strokeWeight(3);
  line(40, 28, width - 40, 28);

  noStroke();
  textAlign(CENTER, TOP);
  textFont('Georgia');
  textStyle(BOLD);
  textSize(18);
  fill(0);
  text('15 Variations on a Single Theme', width / 2, 38);

  textStyle(NORMAL);
  textFont('Courier New');
  textSize(11);
  fill(80);
  text('inspired by M A X   B I L L', width / 2, 64);

  stroke(0);
  strokeWeight(1.5);
  line(40, 82, width - 40, 82);

  // ── CIRCLES ─────────────────────────────────────────────────────────────────
  push();
  translate(300, 480);

  for (let c of circles) {
    let orbitR       = sqrt(c.ox * c.ox + c.oy * c.oy);
    let baseAngle    = atan2(c.oy, c.ox);
    let currentAngle = baseAngle + c.angle;
    let cx = orbitR * cos(currentAngle);
    let cy = orbitR * sin(currentAngle);

    push();
    strokeWeight(c.sw);
    noFill();
    if (c.col.length === 4) stroke(c.col[0], c.col[1], c.col[2], c.col[3]);
    else                    stroke(c.col[0], c.col[1], c.col[2]);
    circle(cx, cy, c.size);
    pop();

    c.angle += c.speed;
  }
  pop();

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  stroke(180);
  strokeWeight(1);
  line(40, height - 50, width - 40, height - 50);

  // Music toggle button
  noStroke();
  let btnX = width / 2 - 70;
  let btnY = height - 40;
  let btnW = 140;
  let btnH = 26;

  if (musicOn) fill(80, 80, 80);
  else         fill(200, 190, 185);
  rect(btnX, btnY, btnW, btnH, 4);

  fill(musicOn ? 238 : 60);
  textAlign(CENTER, CENTER);
  textFont('Courier New');
  textSize(10);
  textStyle(NORMAL);
  text(musicOn ? '\u2669  CHIMES ON' : '\u2669  PLAY CHIMES', width / 2, btnY + 13);

  // Footer caption
  fill(120);
  textSize(9);
  text('C O N C E N T R I C   V A R I A T I O N S   ·   1 9 3 8', width / 2, height - 8);
}

function mousePressed() {
  let btnX = width / 2 - 70;
  let btnY = height - 40;
  let btnW = 140;
  let btnH = 26;

  if (mouseX >= btnX && mouseX <= btnX + btnW &&
      mouseY >= btnY && mouseY <= btnY + btnH) {
    musicOn = !musicOn;
    if (musicOn) startChimes();
    else         stopChimes();
  }
}