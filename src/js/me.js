// Daily Quotes Feature

const quotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
  { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Winston Churchill" }
];

function showDailyQuote() {
  const quoteEl = document.querySelector('.daily-quote');
  const authorEl = document.querySelector('.quote-author');
  if (!quoteEl) return;

  //quote selection based on day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const idx = dayOfYear % quotes.length;
  quoteEl.textContent = `“${quotes[idx].text}”`;
  if (authorEl) authorEl.textContent = `– ${quotes[idx].author}`;
}

showDailyQuote();
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


const nameEl = document.querySelector(".user-name");
const levelEl = document.querySelector(".user-level");
const deptEl = document.querySelector(".user-department");
const semEl = document.querySelector(".user-semester");

if (!nameEl || !levelEl || !deptEl || !semEl) {
  console.warn("One or more user info elements not found on page.");
}

onAuthStateChanged(auth, async (user) => {
  if (!nameEl || !levelEl || !deptEl || !semEl) return;
  if (!user) {
    nameEl.textContent = "Not logged in";
    levelEl.textContent = "Level: --";
    deptEl.textContent = "Department: --";
    semEl.textContent = "Semester: --";
    return;
  }
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      nameEl.textContent = `${data.firstname || ""} ${data.lastname || ""}`.trim() || user.email;
      levelEl.textContent = `Level: ${data.level || "--"}`;
      deptEl.textContent = `Department: ${data.department || "--"}`;
      semEl.textContent = `Semester: ${data.semester || "--"}`;
    } else {
      nameEl.textContent = user.email;
      levelEl.textContent = "Level: --";
      deptEl.textContent = "Department: --";
      semEl.textContent = "Semester: --";
    }
  } catch (err) {
    nameEl.textContent = user.email;
    levelEl.textContent = "Level: --";
    deptEl.textContent = "Department: --";
    semEl.textContent = "Semester: --";
    console.error("Error loading user profile:", err);
  }
});
