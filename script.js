
const $ = id => document.getElementById(id);

const canvas = $("simCanvas");
const ctx = canvas.getContext("2d");

let mode = "translasi";
let running = false;
let elapsed = 0;
let lastFrame = 0;
let animationId = null;

const settings = {
  speed: 2,
  acceleration: 0.5,
  radius: 0.5,
  duration: 10,
  playback: 1
};

function currentVelocity(t) {
  return settings.speed + settings.acceleration * t;
}

function currentPosition(t) {
  return settings.speed * t + 0.5 * settings.acceleration * t * t;
}

function currentOmega(t) {
  return currentVelocity(t) / settings.radius;
}

function updateLabels() {
  $("speedValue").textContent = settings.speed.toFixed(1);
  $("accelerationValue").textContent = settings.acceleration.toFixed(1);
  $("radiusValue").textContent = settings.radius.toFixed(1);
  $("durationValue").textContent = settings.duration;
}

["speed", "acceleration", "radius", "duration"].forEach(id => {
  $(id).addEventListener("input", e => {
    settings[id] = Number(e.target.value);
    updateLabels();
    drawScene();
    drawGraphs();
    updateReadout();
  });
});

$("playback").addEventListener("change", e => {
  settings.playback = Number(e.target.value);
});

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    mode = button.dataset.mode;
    elapsed = 0;
    running = false;
    $("playBtn").textContent = "▶ Mulai";
    updateStageLabel();
    drawScene();
    updateReadout();
    drawGraphs();
  });
});

function updateStageLabel() {
  const labels = {
    translasi: "SIMULASI GERAK TRANSLASI",
    rotasi: "SIMULASI GERAK ROTASI",
    menggelinding: "SIMULASI GERAK MENGGELINDING"
  };
  $("stageLabel").textContent = labels[mode];
}

function drawBall(context, x, y, radius, angle = 0, color = "#4361ee") {
  context.save();
  context.translate(x, y);
  context.rotate(angle);

  const gradient = context.createRadialGradient(
    -radius * 0.35, -radius * 0.4, radius * 0.05,
    0, 0, radius
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, color);
  gradient.addColorStop(1, "#172d75");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#ffffff";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(radius * 0.85, 0);
  context.stroke();

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(0, 0, 4, 0, Math.PI * 2);
  context.fill();

  context.restore();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ground = 270;
  const radius = 35 + settings.radius * 10;
  const t = elapsed;
  const position = currentPosition(t);
  const angle = currentOmega(0) * t;

  ctx.fillStyle = "#e8effb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#b7c5df";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, ground);
  ctx.lineTo(820, ground);
  ctx.stroke();

  for (let x = 30; x <= 820; x += 50) {
    ctx.fillStyle = "#a8b7d0";
    ctx.fillRect(x, ground + 8, 2, 7);
  }

  if (mode === "translasi") {
    const x = 60 + (position * 35) % 700;

    ctx.fillStyle = "#4361ee";
    ctx.fillRect(x - 35, ground - 70, 70, 55);

    ctx.fillStyle = "#ffffff";
    ctx.font = "13px Arial";
    ctx.fillText("Benda", x - 20, ground - 45);

    ctx.beginPath();
    ctx.arc(x - 20, ground - 10, 10, 0, Math.PI * 2);
    ctx.arc(x + 20, ground - 10, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#24334f";
    ctx.fill();

    ctx.fillStyle = "#4361ee";
    ctx.beginPath();
    ctx.moveTo(x + 45, ground - 45);
    ctx.lineTo(x + 75, ground - 45);
    ctx.lineTo(x + 68, ground - 52);
    ctx.moveTo(x + 75, ground - 45);
    ctx.lineTo(x + 68, ground - 38);
    ctx.strokeStyle = "#4361ee";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  if (mode === "rotasi") {
    drawBall(ctx, 425, 150, 75, angle, "#ef9a43");

    ctx.strokeStyle = "#ef9a43";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(425, 150, 95, -0.5, 2.7);
    ctx.stroke();

    ctx.fillStyle = "#ef9a43";
    ctx.font = "bold 15px Arial";
    ctx.fillText("Sumbu putar", 450, 250);
  }

  if (mode === "menggelinding") {
    const x = 65 + (position * 35) % 700;
    drawBall(ctx, x, ground - radius, radius, angle, "#20b99f");

    ctx.strokeStyle = "#20b99f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, ground - radius);
    ctx.lineTo(x + radius, ground - radius);
    ctx.stroke();

    ctx.fillStyle = "#20b99f";
    ctx.font = "13px Arial";
    ctx.fillText("Gerak translasi + rotasi", 35, 40);
  }

  ctx.fillStyle = "#253550";
  ctx.font = "13px Arial";
  ctx.fillText("Waktu: " + t.toFixed(2) + " s", 35, 30);
  ctx.fillText("Posisi: " + position.toFixed(2) + " m", 35, 50);
}

function updateReadout() {
  const t = elapsed;
  const v = currentVelocity(t);
  const x = currentPosition(t);
  const omega = currentOmega(t);

  $("timeRead").textContent = t.toFixed(2) + " s";
  $("positionRead").textContent = x.toFixed(2) + " m";
  $("velocityRead").textContent = v.toFixed(2) + " m/s";
  $("omegaRead").textContent = omega.toFixed(2) + " rad/s";
}

function drawGraph(canvasId, type) {
  const c = $(canvasId);
  const g = c.getContext("2d");
  const w = c.width;
  const h = c.height;

  g.clearRect(0, 0, w, h);
  g.fillStyle = "#192943";
  g.fillRect(0, 0, w, h);

  const left = 45, right = 15, top = 15, bottom = 35;
  const plotW = w - left - right;
  const plotH = h - top - bottom;

  const duration = settings.duration;
  const maxValue = type === "position"
    ? Math.max(1, currentPosition(duration) * 1.15)
    : Math.max(1, currentVelocity(duration) * 1.15);

  g.strokeStyle = "#52617a";
  g.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = top + (plotH * i) / 4;
    g.beginPath();
    g.moveTo(left, y);
    g.lineTo(w - right, y);
    g.stroke();

    const value = maxValue * (1 - i / 4);
    g.fillStyle = "#b9c5d8";
    g.font = "10px Arial";
    g.fillText(value.toFixed(1), 5, y + 3);
  }

  for (let i = 0; i <= 5; i++) {
    const x = left + (plotW * i) / 5;
    g.beginPath();
    g.moveTo(x, top);
    g.lineTo(x, h - bottom);
    g.stroke();

    g.fillStyle = "#b9c5d8";
    g.fillText((duration * i / 5).toFixed(0), x - 4, h - 12);
  }

  g.strokeStyle = type === "position" ? "#55d6d0" : "#ffb36b";
  g.lineWidth = 3;
  g.beginPath();

  for (let i = 0; i <= 100; i++) {
    const t = duration * i / 100;
    const value = type === "position" ? currentPosition(t) : currentVelocity(t);
    const x = left + (t / duration) * plotW;
    const y = top + plotH - (value / maxValue) * plotH;

    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }

  g.stroke();

  const currentX = left + (elapsed / duration) * plotW;
  g.strokeStyle = "#ffffff";
  g.setLineDash([4, 4]);
  g.beginPath();
  g.moveTo(currentX, top);
  g.lineTo(currentX, h - bottom);
  g.stroke();
  g.setLineDash([]);

  g.fillStyle = "#dbe5f4";
  g.font = "11px Arial";
  g.fillText("Waktu (s)", w / 2 - 20, h - 2);
}

function drawGraphs() {
  drawGraph("positionChart", "position");
  drawGraph("velocityChart", "velocity");
}

function drawComparison() {
  const c = $("comparisonCanvas");
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = "#f5f8ff";
  g.fillRect(0, 0, c.width, c.height);

  const rows = [
    { y: 65, label: "TRANSLASI", color: "#4361ee", type: "translation" },
    { y: 150, label: "ROTASI", color: "#ef9a43", type: "rotation" },
    { y: 235, label: "MENGGELINDING", color: "#20b99f", type: "rolling" }
  ];

  rows.forEach(row => {
    g.fillStyle = "#253550";
    g.font = "bold 12px Arial";
    g.fillText(row.label, 20, row.y - 30);

    g.strokeStyle = "#c9d5e8";
    g.beginPath();
    g.moveTo(20, row.y + 30);
    g.lineTo(820, row.y + 30);
    g.stroke();

    if (row.type === "translation") {
      const x = 120 + (elapsed * 35) % 650;
      g.fillStyle = row.color;
      g.fillRect(x, row.y - 12, 65, 30);
    }

    if (row.type === "rotation") {
      g.save();
      g.translate(425, row.y);
      g.rotate(elapsed * 1.8);
      g.fillStyle = row.color;
      g.beginPath();
      g.arc(0, 0, 22, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "white";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(20, 0);
      g.stroke();
      g.restore();
    }

    if (row.type === "rolling") {
      const x = 120 + (elapsed * 35) % 650;
      g.save();
      g.translate(x, row.y);
      g.rotate(elapsed * 1.8);
      g.fillStyle = row.color;
      g.beginPath();
      g.arc(0, 0, 22, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "white";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(20, 0);
      g.stroke();
      g.restore();
    }
  });
}

function renderAll() {
  drawScene();
  drawGraphs();
  drawComparison();
  updateReadout();
}

function animate(timestamp) {
  if (!running) return;

  if (!lastFrame) lastFrame = timestamp;
  const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
  lastFrame = timestamp;

  elapsed += delta * settings.playback;

  if (elapsed >= settings.duration) {
    elapsed = settings.duration;
    running = false;
    $("playBtn").textContent = "▶ Mulai";
  }

  renderAll();

  if (running) {
    animationId = requestAnimationFrame(animate);
  }
}

$("playBtn").addEventListener("click", () => {
  if (running) {
    running = false;
    cancelAnimationFrame(animationId);
    $("playBtn").textContent = "▶ Lanjutkan";
  } else {
    if (elapsed >= settings.duration) elapsed = 0;
    running = true;
    lastFrame = 0;
    $("playBtn").textContent = "Ⅱ Jeda";
    animationId = requestAnimationFrame(animate);
  }
});

$("resetBtn").addEventListener("click", () => {
  running = false;
  cancelAnimationFrame(animationId);
  elapsed = 0;
  $("playBtn").textContent = "▶ Mulai";
  renderAll();
});

function setupExperiment() {
  const updateOne = () => {
    const v = Number($("expV").value);
    const r = Number($("expR").value);
    const omega = v / r;

    $("expVLabel").textContent = v + " m/s";
    $("expRLabel").textContent = r.toFixed(1) + " m";
    $("expOmega").textContent = omega.toFixed(2) + " rad/s";
  };

  const updateTwo = () => {
    const omega = Number($("expW").value);
    const r = Number($("expR2").value);
    const v = omega * r;

    $("expWLabel").textContent = omega + " rad/s";
    $("expR2Label").textContent = r.toFixed(1) + " m";
    $("expLinear").textContent = v.toFixed(2) + " m/s";
  };

  ["expV", "expR"].forEach(id => $(id).addEventListener("input", updateOne));
  ["expW", "expR2"].forEach(id => $(id).addEventListener("input", updateTwo));

  updateOne();
  updateTwo();
}

const questions = [
  {
    q: "Apa yang dimaksud dengan gerak translasi?",
    a: [
      "Gerak benda mengelilingi sumbu",
      "Gerak perpindahan benda dari satu tempat ke tempat lain",
      "Gerak benda yang selalu bergetar",
      "Gerak benda tanpa perpindahan"
    ],
    correct: 1,
    explain: "Benar! Gerak translasi merupakan gerak perpindahan benda."
  },
  {
    q: "Contoh gerak rotasi dalam kehidupan sehari-hari adalah ...",
    a: ["Mobil melaju lurus", "Bola jatuh bebas", "Kipas angin berputar", "Buah jatuh dari pohon"],
    correct: 2,
    explain: "Kipas angin berputar terhadap sumbu sehingga mengalami gerak rotasi."
  },
  {
    q: "Gerak menggelinding merupakan gabungan dari ...",
    a: ["Translasi dan rotasi", "Getaran dan gelombang", "Translasi dan getaran", "Rotasi dan gravitasi"],
    correct: 0,
    explain: "Gerak menggelinding merupakan kombinasi gerak translasi dan rotasi."
  },
  {
    q: "Persamaan hubungan kecepatan linear dan kecepatan sudut pada gerak menggelinding tanpa slip adalah ...",
    a: ["v = ω/R", "v = ωR", "v = R/ω", "v = ω + R"],
    correct: 1,
    explain: "Hubungannya adalah v = ωR."
  },
  {
    q: "Jika kecepatan linear tetap dan jari-jari diperbesar, kecepatan sudut akan ...",
    a: ["Semakin besar", "Tetap", "Semakin kecil", "Menjadi nol"],
    correct: 2,
    explain: "Dari ω = v/R, jika v tetap dan R membesar, maka ω mengecil."
  }
];

let questionIndex = 0;
let score = 0;
let selectedAnswer = null;
let answered = false;

function showQuestion() {
  const question = questions[questionIndex];
  selectedAnswer = null;
  answered = false;

  $("questionNumber").textContent =
    `PERTANYAAN ${questionIndex + 1} DARI ${questions.length}`;

  $("scoreLabel").textContent = `Skor: ${score}`;
  $("progressBar").style.width =
    `${((questionIndex + 1) / questions.length) * 100}%`;

  $("questionText").textContent = question.q;
  $("feedback").textContent = "";
  $("nextBtn").classList.add("hidden");
  $("checkBtn").classList.remove("hidden");
  $("checkBtn").disabled = false;

  $("answers").innerHTML = "";

  question.a.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;

    button.addEventListener("click", () => {
      if (answered) return;

      selectedAnswer = index;
      document.querySelectorAll(".answer-option").forEach(option =>
        option.classList.remove("selected")
      );
      button.classList.add("selected");
    });

    $("answers").appendChild(button);
  });
}

$("checkBtn").addEventListener("click", () => {
  if (selectedAnswer === null) {
    $("feedback").textContent = "Pilih salah satu jawaban terlebih dahulu.";
    return;
  }

  answered = true;
  const question = questions[questionIndex];
  const options = document.querySelectorAll(".answer-option");

  options[question.correct].classList.add("correct");

  if (selectedAnswer === question.correct) {
    score += 20;
    $("feedback").textContent = "✓ " + question.explain;
    $("feedback").style.color = "#168b58";
  } else {
    options[selectedAnswer].classList.add("wrong");
    $("feedback").textContent = "✗ Belum tepat. " + question.explain;
    $("feedback").style.color = "#d44e4e";
  }

  $("scoreLabel").textContent = `Skor: ${score}`;
  $("checkBtn").classList.add("hidden");
  $("nextBtn").classList.remove("hidden");
  $("nextBtn").textContent =
    questionIndex === questions.length - 1 ? "Lihat Hasil" : "Pertanyaan Berikutnya →";
});

$("nextBtn").addEventListener("click", () => {
  questionIndex++;

  if (questionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  $("questionNumber").textContent = "HASIL EVALUASI";
  $("scoreLabel").textContent = `Skor: ${score}`;
  $("progressBar").style.width = "100%";
  $("questionText").textContent = `Skor akhir kamu: ${score} dari 100`;

  $("answers").innerHTML = "";
  $("feedback").textContent =
    score >= 80 ? "Hebat! Pemahamanmu sangat baik." :
    score >= 60 ? "Bagus! Terus tingkatkan pemahamanmu." :
    "Ayo pelajari kembali materi dan coba lagi.";

  $("feedback").style.color = "#4361ee";
  $("checkBtn").classList.add("hidden");
  $("nextBtn").classList.remove("hidden");
  $("nextBtn").textContent = "Ulangi Kuis";
  $("nextBtn").onclick = resetQuiz;
}

function resetQuiz() {
  questionIndex = 0;
  score = 0;
  $("nextBtn").onclick = null;
  showQuestion();
}

updateLabels();
setupExperiment();
showQuestion();
renderAll();
drawComparison();
