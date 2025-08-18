
// Pomodoro Timer Settings
const MODES = {
  pomodoro: { label: "Pomodoro", duration: 25 * 60 },
  short: { label: "Short Break", duration: 5 * 60 },
  long: { label: "Long Break", duration: 15 * 60 }
};

let currentMode = "pomodoro";
let sessionCount = 1;
let timer = null;
let timeLeft = MODES[currentMode].duration;
let isRunning = false;

const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const modeBtns = document.querySelectorAll(".mode-btn");
const sessionLabel = document.getElementById("session-label");

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  sessionLabel.textContent = `Session: ${sessionCount} (${MODES[currentMode].label})`;
  modeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === currentMode);
  });
  startBtn.textContent = isRunning ? "Pause" : "Start";
}

function switchMode(mode) {
  currentMode = mode;
  timeLeft = MODES[mode].duration;
  stopTimer();
  updateDisplay();
}

function startTimer() {
  if (isRunning) {
    // Pause
    stopTimer();
    updateDisplay();
    return;
  }
  isRunning = true;
  updateDisplay();
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      stopTimer();
      handleSessionEnd();
    }
  }, 1000);
}

function stopTimer() {
  isRunning = false;
  if (timer) clearInterval(timer);
  timer = null;
  updateDisplay();
}

function resetTimer() {
  timeLeft = MODES[currentMode].duration;
  stopTimer();
  updateDisplay();
}

function handleSessionEnd() {
  // Play alarm sound
  const alarm = document.getElementById("alarm-audio");
  if (alarm) {
    alarm.currentTime = 0;
    alarm.play();
  }
  if (currentMode === "pomodoro") {
    if (sessionCount % 4 === 0) {
      switchMode("long");
    } else {
      switchMode("short");
    }
    sessionCount++;
  } else {
    switchMode("pomodoro");
  }
  updateDisplay();
}

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchMode(btn.dataset.mode);
    updateDisplay();
  });
});

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display
updateDisplay();
