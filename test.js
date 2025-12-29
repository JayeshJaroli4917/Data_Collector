/* ===============================
   LOGIN CHECK
   =============================== */
const loggedInUser = localStorage.getItem("loggedInUser");

if (!loggedInUser) {
  alert("Please login first");
  window.location.href = "index.html"; // or login.html
}

/* ===============================
   GLOBAL STATE
   =============================== */
let keyDownTimes = {};
let lastKeyReleaseTime = null;
let individualKeys = [];
let digraphs = [];

let duration = 30;
let timerInterval;
let testCompleted = false;

/* ===============================
   DOM ELEMENTS
   =============================== */
const area = document.getElementById("typingArea");
const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const timerDisplay = document.getElementById("timer");
const referenceTextEl = document.getElementById("referenceText");

/* ===============================
   SECURITY BLOCKS
   =============================== */
document.addEventListener("contextmenu", e => e.preventDefault());

["copy", "paste", "cut", "drop"].forEach(evt =>
  document.addEventListener(evt, e => e.preventDefault())
);

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

/* ===============================
   WORD GENERATOR
   =============================== */
const DICTIONARY = [
  "time","people","year","day","world","life","computer","keyboard","software",
  "network","frontend","backend","security","performance","cloud","data",
  "algorithm","logic","system","analysis","design","development","testing"
];

function generateRandomWords(count = 25) {
  let words = [];
  for (let i = 0; i < count; i++) {
    words.push(DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)]);
  }
  return words.join(" ");
}

let referenceText = "";

function loadInitialWords() {
  referenceText = generateRandomWords();
  referenceTextEl.textContent = referenceText;
}

function extendWordsIfNeeded(typedLength) {
  if (typedLength + 100 > referenceText.length) {
    referenceText += " " + generateRandomWords(20);
    referenceTextEl.textContent = referenceText;
  }
}

/* ===============================
   START TEST
   =============================== */
startBtn.onclick = () => {
  keyDownTimes = {};
  lastKeyReleaseTime = null;
  individualKeys = [];
  digraphs = [];
  testCompleted = false;
  duration = 30;

  area.value = "";
  area.disabled = false;
  area.focus();

  startBtn.disabled = true;
  submitBtn.disabled = true;

  loadInitialWords();
  timerDisplay.textContent = "Time Left: 0:30";

  timerInterval = setInterval(() => {
    duration--;

    timerDisplay.textContent =
      `Time Left: ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;

    if (duration <= 0) {
      clearInterval(timerInterval);
      area.disabled = true;
      testCompleted = true;
      submitBtn.disabled = false;
      alert("Time Over! You can now submit.");
    }
  }, 1000);
};

/* ===============================
   TYPING EVENTS
   =============================== */
area.addEventListener("input", () => {
  extendWordsIfNeeded(area.value.length);
});

area.addEventListener("keydown", e => {
  if (!keyDownTimes[e.code]) {
    keyDownTimes[e.code] = performance.now();
  }
});

area.addEventListener("keyup", e => {
  const releaseTime = performance.now();
  const pressTime = keyDownTimes[e.code];
  if (!pressTime) return;

  const holdTime = releaseTime - pressTime;
  const flightTime = lastKeyReleaseTime
    ? pressTime - lastKeyReleaseTime
    : 0;

  individualKeys.push({
    key: e.key,
    code: e.code,
    holdTime_HT: holdTime,
    flightTime_FT: flightTime
  });

  if (individualKeys.length >= 2) {
    const k1 = individualKeys[individualKeys.length - 2];
    const k2 = individualKeys[individualKeys.length - 1];

    digraphs.push({
      digraph: k1.key + k2.key,
      D: k2.holdTime_HT + k2.flightTime_FT
    });
  }

  lastKeyReleaseTime = releaseTime;
  delete keyDownTimes[e.code];
});

/* ===============================
   SUBMIT TEST
   =============================== */
submitBtn.onclick = async () => {
  if (!testCompleted) return;

  submitBtn.disabled = true;

  const payload = {
    username: loggedInUser,
    typedText: area.value.trim(),
    charCount: area.value.length,
    timestamp: new Date().toISOString(),
    individualKeys,
    digraphs
  };

  try {
    const response = await fetch(
      "https://data-collector-backend-teal.vercel.app/api/submit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) throw new Error();

    alert("Data submitted successfully");

  } catch (err) {
    alert("Submission failed. Try again.");
    submitBtn.disabled = false;
  }
};
