/* ===============================
   LOGIN CHECK
   =============================== */
const loggedInUser = localStorage.getItem("loggedInUser");

if (!loggedInUser) {
  alert("Please login first");
  window.location.href = "login.html";
}

/* ===============================
   API CHECK FUNCTION
   =============================== */
async function checkUserAlreadySubmitted(username) {
  try {
    const res = await fetch(
      `https://keylogger-backend.vercel.app/api/check-user?username=${encodeURIComponent(username)}`
    );

    const data = await res.json();
    return data.exists === true;

  } catch (err) {
    alert("Unable to verify test status");
    throw err;
  }
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
   WORDS
   =============================== */
const WORDS = [
  "time","people","computer","keyboard","software",
  "frontend","backend","security","performance","cloud"
];

function randomWords(count = 25) {
  let arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return arr.join(" ");
}

let referenceText = "";

function loadWords() {
  referenceText = randomWords();
  referenceTextEl.textContent = referenceText;
}

/* ===============================
   START TEST
   =============================== */
startBtn.onclick = async () => {
  const alreadySubmitted = await checkUserAlreadySubmitted(loggedInUser);

  if (alreadySubmitted) {
    alert("❌ You already gave the test");
    return;
  }

  // Reset
  keyDownTimes = {};
  individualKeys = [];
  digraphs = [];
  testCompleted = false;
  duration = 30;

  area.value = "";
  area.disabled = false;
  area.focus();

  startBtn.disabled = true;
  submitBtn.disabled = true;

  loadWords();
  timerDisplay.textContent = "Time Left: 0:30";

  timerInterval = setInterval(() => {
    duration--;
    timerDisplay.textContent = `Time Left: 0:${String(duration).padStart(2, "0")}`;

    if (duration <= 0) {
      clearInterval(timerInterval);
      area.disabled = true;
      testCompleted = true;
      submitBtn.disabled = false;
      alert("Time over! Submit now.");
    }
  }, 1000);
};

/* ===============================
   KEYSTROKE CAPTURE
   =============================== */
area.addEventListener("keydown", e => {
  if (!keyDownTimes[e.code]) keyDownTimes[e.code] = performance.now();
});

area.addEventListener("keyup", e => {
  const release = performance.now();
  const press = keyDownTimes[e.code];
  if (!press) return;

  individualKeys.push({
    key: e.key,
    holdTime: release - press
  });

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
    typedText: area.value,
    charCount: area.value.length,
    timestamp: new Date().toISOString(),
    individualKeys,
    digraphs
  };

  try {
    const res = await fetch(
      "https://keylogger-backend.vercel.app/api/submit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) throw new Error();

    alert("✅ Test submitted successfully");

  } catch {
    alert("Submission failed");
    submitBtn.disabled = false;
  }
};
