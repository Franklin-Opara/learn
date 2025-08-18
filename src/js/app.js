import { auth, db } from "./firebase.js";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Dashboard logic
const welcomeSection = document.querySelector(".welcome-section h1");
const planCard = document.querySelector(".card-section .card:nth-child(1)");
const planCardP = planCard ? planCard.querySelector("p") : null;
const planCardLink = planCard ? planCard.querySelector(".card-link") : null;
const assignmentsCard = document.querySelector(".card-section .card:nth-child(2)");
const assignmentsCardP = assignmentsCard ? assignmentsCard.querySelector("p") : null;
const assignmentsCardLink = assignmentsCard ? assignmentsCard.querySelector(".card-link") : null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  // Show user name if available
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().firstname) {
      if (welcomeSection) welcomeSection.textContent = `Welcome back, ${userSnap.data().firstname} 👋`;
    }
  } catch {}

  // Show today's study sessions
  if (planCardP && planCardLink) {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const sessionsRef = collection(db, "users", user.uid, "sessions");
      const q = query(sessionsRef, where("date", "==", todayStr));
      const snap = await getDocs(q);
      if (snap.empty) {
        planCardP.textContent = "No study session added yet";
      } else {
        let html = "";
        snap.forEach(docSnap => {
          const s = docSnap.data();
          html += `<div><strong>${s.course}</strong>: ${s.topic} at ${s.time}</div>`;
        });
        planCardP.innerHTML = html;
      }
      planCardLink.href = "add-session.html";
      planCardLink.textContent = "+ Add Study Session";
    } catch {}
  }

  // Show assignments due this week
  if (assignmentsCardP && assignmentsCardLink) {
    try {
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const yyyy2 = weekFromNow.getFullYear();
      const mm2 = String(weekFromNow.getMonth() + 1).padStart(2, '0');
      const dd2 = String(weekFromNow.getDate()).padStart(2, '0');
      const weekStr = `${yyyy2}-${mm2}-${dd2}`;
      const assignmentsRef = collection(db, "users", user.uid, "assignments");
      const q = query(assignmentsRef, where("dueDate", ">=", todayStr), where("dueDate", "<=", weekStr));
      const snap = await getDocs(q);
      const count = snap.size;
      if (count === 0) {
        assignmentsCardP.textContent = "No assignments due this week";
      } else if (count === 1) {
        assignmentsCardP.textContent = "You have 1 assignment due this week";
      } else {
        assignmentsCardP.textContent = `You have ${count} assignments due this week`;
      }
      assignmentsCardLink.href = "assignments.html";
      assignmentsCardLink.textContent = "View Assignments";
    } catch {}
  }
});
