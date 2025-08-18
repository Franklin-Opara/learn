import { auth, db } from "./firebase.js";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Handle add-session.html logic
const courseSelect = document.getElementById("course");
const form = document.querySelector(".auth-form");
if (courseSelect && form) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in to add a session.");
      window.location.href = "login.html";
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const courses = userSnap.exists() && userSnap.data().courses ? userSnap.data().courses : [];
    // Remove existing options except the first
    while (courseSelect.options.length > 1) courseSelect.remove(1);
    courses.forEach(course => {
      const opt = document.createElement("option");
      opt.value = course.code;
      opt.textContent = `${course.code} – ${course.title}`;
      courseSelect.appendChild(opt);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to add a session.");
      window.location.href = "login.html";
      return;
    }
    const course = courseSelect.value;
    const topic = document.getElementById("topic").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    if (!course || !topic || !date || !time) {
      alert("Please fill out all fields.");
      return;
    }
    try {
      const sessionData = {
        course,
        topic,
        date,
        time,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "users", user.uid, "sessions"), sessionData);
      alert("Session saved!");
      window.location.href = "planner.html";
    } catch (err) {
      alert("Error saving session: " + err.message);
      console.error(err);
    }
  });
}

// If on planner.html, fetch and display sessions
const plannerListEl = document.querySelector(".planner-list");
if (plannerListEl) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in to view your planner.");
      window.location.href = "login.html";
      return;
    }
    plannerListEl.innerHTML = "<p>Loading sessions...</p>";
    try {
      const sessionsRef = collection(db, "users", user.uid, "sessions");
      const q = query(sessionsRef, orderBy("date", "asc"), orderBy("time", "asc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        plannerListEl.innerHTML = "<p>No study sessions found. <a href='add-session.html'>Add one?</a></p>";
        return;
      }
      plannerListEl.innerHTML = "";
      snap.forEach(docSnap => {
        const s = docSnap.data();
        const id = docSnap.id;
        if (!s.date || !s.time || !s.course || !s.topic) return;
        // Tag: Today, Tomorrow, or date
        const today = new Date();
        let tag = s.date;
        let sessionDate;
        try {
          sessionDate = new Date(s.date);
        } catch (e) {
          tag = s.date;
        }
        if (sessionDate &&
          sessionDate.getFullYear() === today.getFullYear() &&
          sessionDate.getMonth() === today.getMonth() &&
          sessionDate.getDate() === today.getDate()
        ) {
          tag = "Today";
        } else if (sessionDate) {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          if (
            sessionDate.getFullYear() === tomorrow.getFullYear() &&
            sessionDate.getMonth() === tomorrow.getMonth() &&
            sessionDate.getDate() === tomorrow.getDate()
          ) {
            tag = "Tomorrow";
          }
        }
        // Render session card
        const card = document.createElement("div");
        card.className = "session-card";
        card.innerHTML = `
          <h3>${s.course}</h3>
          <p>🕒 ${s.time}</p>
          <p>📍Topic: ${s.topic}</p>
          <div class="tag-delete">
            <span class="tag">${tag}</span>
            <button class="delete-btn" data-id="${id}">Delete</button>
          </div>
        `;
        plannerListEl.appendChild(card);
      });
      // Add delete event listeners
      plannerListEl.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          if (confirm('Delete this study session?')) {
            await import("firebase/firestore").then(({ doc, deleteDoc }) =>
              deleteDoc(doc(db, "users", user.uid, "sessions", id))
            );
            btn.closest('.session-card').remove();
          }
        });
      });
    } catch (err) {
      plannerListEl.innerHTML = `<p>Error loading sessions.</p>`;
      console.error("Error loading sessions:", err);
    }
  });
}

// ...existing code...
